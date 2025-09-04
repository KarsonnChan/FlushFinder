import React from 'react';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';

const GoogleMapsTest = () => {
  const handlePlaceSelect = (place) => {
    console.log('Selected place:', place);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Google Maps API Test</h2>
      <div className="max-w-md">
        <GoogleMapsAutocomplete
          onPlaceSelect={handlePlaceSelect}
          placeholder="Test Google Maps - Enter a location"
        />
      </div>
    </div>
  );
};

export default GoogleMapsTest;
