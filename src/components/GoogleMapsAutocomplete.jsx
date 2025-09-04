import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

const GoogleMapsAutocomplete = ({ onPlaceSelect, placeholder = "Enter address", value = "", showValidation = false, hasError = false }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(value);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGoogleMapsAPI();
  }, []);

  const loadGoogleMapsAPI = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      initializeAutocomplete();
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkLoaded = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsLoaded(true);
          initializeAutocomplete();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    setIsLoading(true);
    setError(null);

    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('API key is missing. Environment state:', {
        hasKey: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        envKeys: Object.keys(import.meta.env)
      });
      setError('Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      setIsLoading(false);
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    
    console.log('Loading Google Maps with key:', apiKey);
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      setIsLoaded(true);
      setIsLoading(false);
      initializeAutocomplete();
    };
    
    script.onerror = (error) => {
      console.error('Google Maps script failed to load:', error);
      setError('Failed to load Google Maps API. Please check your API key and internet connection.');
      setIsLoading(false);
    };

    document.head.appendChild(script);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    // Create autocomplete instance
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'], // Restrict to real places
      fields: ['place_id', 'formatted_address', 'geometry'],
      componentRestrictions: { country: 'CA' }, // Restrict to Canada
      strictBounds: false
    });

    // Update input value when user types
    const handleInputChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      // Notify parent component about input changes
      if (onPlaceSelect) {
        onPlaceSelect({
          formatted_address: newValue,
          geometry: null,
          place_id: null
        });
      }
    };

    inputRef.current.addEventListener('input', handleInputChange);

    // Listen for place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        console.error('No location data available for this place');
        return;
      }

      const fullAddress = place.formatted_address;
      const coordinates = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      if (onPlaceSelect) {
        onPlaceSelect({
          place_id: place.place_id,
          formatted_address: fullAddress,
          geometry: {
            location: coordinates
          }
        });
      }

      setInputValue(fullAddress);
    });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Prevent form submission when pressing Enter on autocomplete
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  if (error) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Error loading Google Maps..."
          disabled
          className="w-full pl-10 pr-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50"
        />
        <p className="text-xs text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (isLoading || !isLoaded) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Loading Google Maps..." : "Initializing..."}
          disabled
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${showValidation && hasError ? 'text-red-400' : 'text-gray-400'} w-5 h-5`} />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoComplete="off"
      />
    </div>
  );
};

export default GoogleMapsAutocomplete;
