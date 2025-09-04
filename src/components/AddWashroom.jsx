import React, { useState } from 'react';
import { MapPin, Star, Camera, ArrowLeft } from 'lucide-react';
import { uploadImages, addWashroom } from '../services/washroomService';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';
import { getCurrentUser } from '../services/authService';

const AddWashroom = ({ onBack, onWashroomAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    rating: 0,
    amenities: [],
    description: '',
    location: null // Will store the full Google Maps place data
  });
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    name: false,
    address: false,
    images: false,
    rating: false
  });
  const [showValidation, setShowValidation] = useState(false);

  // Validation check function
  const validateForm = () => {
    const errors = {
      name: !formData.name.trim(),
      address: !isValidAddress || !formData.address || !formData.location || !formData.location.placeId,
      images: selectedImages.length === 0,
      rating: formData.rating === 0
    };
    
    // If address field is empty or modified without selection, invalidate it
    if (formData.address && (!formData.location || !formData.location.placeId)) {
      errors.address = true;
      setIsValidAddress(false);
    }
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Check validation on form data changes only after first submit attempt
  React.useEffect(() => {
    if (showValidation) {
      validateForm();
    }
  }, [formData.name, formData.address, selectedImages.length]);

  const amenityOptions = [
    'Accessible',
    'Baby changing',
    '24/7',
    'Clean',
    'Private',
    'Well-maintained',
    'Free',
    'Quiet',
    'Well-stocked',
    'Hand dryer',
    'Paper towels',
    'Soap dispenser'
  ];

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      const newImages = prev.filter(img => img.id !== imageId);
      // Update validation state if no images remain
      if (newImages.length === 0) {
        setValidationErrors(prev => ({ ...prev, images: true }));
      }
      return newImages;
    });
  };

  const handleStarClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    
    // Run validation checks
    if (!validateForm()) {
      // Scroll to the first error if any
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload images to Firebase Storage
      let imageUrls = [];
      if (selectedImages.length > 0) {
        console.log('Uploading images...');
        imageUrls = await uploadImages(selectedImages);
      }

      // Step 2: Prepare washroom data
      // Get current user
      const user = getCurrentUser();
      if (!user) {
        throw new Error('You must be signed in to add a washroom');
      }

      const washroomData = {
        name: formData.name,
        address: formData.address,
        rating: formData.rating,
        amenities: formData.amenities,
        description: formData.description,
        images: imageUrls,
        createdAt: new Date().toISOString(),
        location: formData.location, // Include the Google Maps location data
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhotoURL: user.photoURL
      };

      // Step 3: Add to Firestore
      console.log('Adding washroom to database...');
      const newWashroom = await addWashroom(washroomData);

      // Step 4: Clean up preview URLs
      selectedImages.forEach(image => {
        URL.revokeObjectURL(image.preview);
      });

      // Step 5: Notify parent component
      onWashroomAdded(newWashroom);
      
      // Step 6: Go back to home
      onBack();
      
    } catch (error) {
      console.error('Error adding washroom:', error);
      alert('Failed to add washroom. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => handleStarClick(star)}
        onMouseEnter={() => setHoveredStar(star)}
        onMouseLeave={() => setHoveredStar(0)}
        className="p-1"
      >
        <Star
          className={`w-8 h-8 transition-colors ${
            star <= (hoveredStar || formData.rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 hover:text-yellow-300'
          }`}
        />
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add New Washroom</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-6">
            
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Add Photos
              </label>
              
              {/* Upload Button */}
              <div className="mb-4">
                <label className="cursor-pointer">
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    showValidation && validationErrors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <Camera className={`w-12 h-12 mx-auto mb-2 ${showValidation && validationErrors.images ? 'text-red-400' : 'text-gray-400'}`} />
                    <p className={`mb-1 ${showValidation && validationErrors.images ? 'text-red-600' : 'text-gray-600'}`}>Click to add photos</p>
                    <p className={`text-sm ${showValidation && validationErrors.images ? 'text-red-400' : 'text-gray-400'}`}>Upload from gallery or files</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      handleImageUpload(e);
                      setValidationErrors(prev => ({ ...prev, images: false }));
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {showValidation && validationErrors.images && (
                <p className="mt-1 text-sm text-red-600">Please add at least one photo</p>
              )}

              {/* Image Previews */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Washroom Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setFormData(prev => ({ ...prev, name: newName }));
                  setValidationErrors(prev => ({ ...prev, name: !newName.trim() }));
                }}
                onBlur={(e) => {
                  setValidationErrors(prev => ({ ...prev, name: !e.target.value.trim() }));
                }}
                placeholder="e.g., Central Mall Restroom"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  showValidation && validationErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {showValidation && validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">Please enter a washroom name</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <GoogleMapsAutocomplete
                  value={formData.address}
                  showValidation={showValidation}
                  hasError={validationErrors.address}
                  onPlaceSelect={(place) => {
                    // Update form data with the new place info
                    setFormData(prev => ({
                      ...prev,
                      address: place.formatted_address || '',
                      location: place.geometry ? {
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng,
                        placeId: place.place_id
                      } : null
                    }));

                    // Update validation states
                    const isValid = place.geometry !== null && place.place_id !== null;
                    setIsValidAddress(isValid);
                    setValidationErrors(prev => ({ ...prev, address: !isValid }));
                  }}
                  placeholder="Search for an address"
                />
                {(formData.address && !isValidAddress) && (
                  <p className="mt-1 text-sm text-red-600">Please select a valid address from the suggestions</p>
                )}
                {validationErrors.address && !formData.address && (
                  <p className="mt-1 text-sm text-red-600">Address is required</p>
                )}
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Rating
              </label>
              <div className="flex items-center space-x-1">
                {renderStars()}
                {formData.rating > 0 ? (
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                  </span>
                ) : showValidation && validationErrors.rating && (
                  <span className="ml-3 text-sm text-red-600">
                    Please select a rating
                  </span>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenityOptions.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      formData.amenities.includes(amenity)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Any additional information about this washroom..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div> */}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Adding Washroom...' : 'Add Washroom'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWashroom;
