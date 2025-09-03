import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Star, User, Camera, ArrowLeft } from 'lucide-react';

import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config/firebase';

//Replacement
// Replace mockFirebase.uploadImages with:
const uploadImages = async (images) => {
  const imageUrls = [];
  for (const image of images) {
    const imageRef = ref(storage, `washroom-images/${Date.now()}-${image.file.name}`);
    const uploadResult = await uploadBytes(imageRef, image.file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    imageUrls.push(downloadURL);
  }
  return imageUrls;
};

// Replace mockFirebase.addWashroom with:
const addWashroom = async (washroomData) => {
  const docRef = await addDoc(collection(db, 'washrooms'), washroomData);
  return { id: docRef.id, ...washroomData };
};

// Replace mockFirebase.getWashrooms with:
const getWashrooms = async () => {
  const q = query(collection(db, 'washrooms'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

//End replacement

// Add Washroom Component
const AddWashroom = ({ onBack, onWashroomAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    rating: 0,
    amenities: [],
    description: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      return prev.filter(img => img.id !== imageId);
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
    setIsSubmitting(true);

    try {
      // Step 1: Upload images to Firebase Storage
      let imageUrls = [];
      if (selectedImages.length > 0) {
        console.log('Uploading images...');
        imageUrls = await uploadImages(selectedImages);
        
        // Real Firebase code would be:
        // const imageUrls = [];
        // for (const image of selectedImages) {
        //   const imageRef = ref(storage, `washroom-images/${Date.now()}-${image.file.name}`);
        //   const uploadResult = await uploadBytes(imageRef, image.file);
        //   const downloadURL = await getDownloadURL(uploadResult.ref);
        //   imageUrls.push(downloadURL);
        // }
      }

      // Step 2: Prepare washroom data
      const washroomData = {
        name: formData.name,
        address: formData.address,
        rating: formData.rating,
        amenities: formData.amenities,
        description: formData.description,
        images: imageUrls,
        createdAt: new Date().toISOString(),
        // In real app, you'd also store user ID and coordinates
      };

      // Step 3: Add to Firestore
      console.log('Adding washroom to database...');
      const newWashroom = await addWashroom(washroomData);
      
      // Real Firebase code would be:
      // const docRef = await addDoc(collection(db, 'washrooms'), washroomData);
      // const newWashroom = { id: docRef.id, ...washroomData };

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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-1">Click to add photos</p>
                    <p className="text-sm text-gray-400">Upload from gallery or files</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

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
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Central Mall Restroom"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter full address"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Rating
              </label>
              <div className="flex items-center space-x-1">
                {renderStars()}
                {formData.rating > 0 && (
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.rating} star{formData.rating !== 1 ? 's' : ''}
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
            <div>
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
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.address || formData.rating === 0 || isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  formData.name && formData.address && formData.rating > 0 && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
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

// Home Page Component
const ToiletFinderHome = ({ onAddWashroom, washrooms, refreshWashrooms }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleProfileClick = () => {
    // Navigate to profile page
    console.log('Navigate to profile');
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await refreshWashrooms();
    setIsLoading(false);
  };

  const WashroomCard = ({ washroom }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      <div className="relative">
        <img 
          src={washroom.images?.[0] || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop"} 
          alt={washroom.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{washroom.rating}</span>
        </div>
        {/* New indicator for recently added washrooms */}
        {washroom.isNew && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            New!
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{washroom.name}</h3>
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="flex-1">{washroom.address}</span>
          <span className="ml-2 font-medium text-blue-600">{washroom.distance}</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {washroom.amenities?.map((amenity, index) => (
            <span 
              key={index}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header with Title and Profile */}
          <div className="relative mb-8">
            {/* Main Title - Centered */}
            <h1 className="text-5xl md:text-6xl font-bold text-center text-gray-900">
              toilet finder
            </h1>
            
            {/* Profile Picture - Top Right */}
            <div className="absolute top-0 right-0">
              <button 
                onClick={handleProfileClick}
                className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200 group"
              >
                <User className="w-6 h-6 text-gray-600 group-hover:text-gray-700" />
              </button>
            </div>
          </div>
          
          {/* Search Bar and Add Button */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for washrooms near you..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>
            
            <button
              onClick={onAddWashroom}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Washroom</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nearby Washrooms</h2>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {washrooms.map(washroom => (
            <WashroomCard key={washroom.id} washroom={washroom} />
          ))}
        </div>
        
        {washrooms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No washrooms found nearby</h3>
            <p className="text-gray-500 mb-4">Be the first to add a washroom in your area!</p>
            <button
              onClick={onAddWashroom}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Washroom</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [washrooms, setWashrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load washrooms on app start
  useEffect(() => {
    loadWashrooms();
  }, []);

  const loadWashrooms = async () => {
    try {
      setIsLoading(true);
      const washroomsData = await getWashrooms();
      setWashrooms(washroomsData);
      
      // Real Firebase code would be:
      // const q = query(collection(db, 'washrooms'), orderBy('createdAt', 'desc'));
      // const querySnapshot = await getDocs(q);
      // const washroomsData = querySnapshot.docs.map(doc => ({
      //   id: doc.id,
      //   ...doc.data()
      // }));
      // setWashrooms(washroomsData);
      
    } catch (error) {
      console.error('Error loading washrooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToAddWashroom = () => {
    setCurrentPage('addWashroom');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  const handleWashroomAdded = (newWashroom) => {
    // Add the new washroom to the top of the list with a "new" indicator
    const washroomWithNewFlag = {
      ...newWashroom,
      isNew: true
    };
    
    setWashrooms(prevWashrooms => [washroomWithNewFlag, ...prevWashrooms]);
    
    // Remove the "new" flag after 10 seconds
    setTimeout(() => {
      setWashrooms(prevWashrooms => 
        prevWashrooms.map(w => 
          w.id === newWashroom.id 
            ? { ...w, isNew: false }
            : w
        )
      );
    }, 10000);
  };

  const refreshWashrooms = async () => {
    await loadWashrooms();
  };

  if (isLoading && currentPage === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading washrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {currentPage === 'home' && (
        <ToiletFinderHome 
          onAddWashroom={navigateToAddWashroom} 
          washrooms={washrooms}
          refreshWashrooms={refreshWashrooms}
        />
      )}
      {currentPage === 'addWashroom' && (
        <AddWashroom 
          onBack={navigateToHome} 
          onWashroomAdded={handleWashroomAdded}
        />
      )}
    </div>
  );
};

export default App;