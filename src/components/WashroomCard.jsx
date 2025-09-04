import React, { useState } from 'react';
import { Star, MapPin, Flag } from 'lucide-react';
import { reportWashroom } from '../services/washroomService';

const WashroomCard = ({ washroom, onClick, distance }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const formatDistance = (distance) => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const handleReport = async (e) => {
    e.stopPropagation(); // Prevent card click
    if (isReporting || reportSuccess) return;
    
    setIsReporting(true);
    try {
      await reportWashroom(washroom.id);
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 3000); // Reset after 3 seconds
    } catch (error) {
      console.error('Error reporting washroom:', error);
    } finally {
      setIsReporting(false);
    }
  };
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
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
          {distance && (
            <span className="ml-2 font-medium text-blue-600">{formatDistance(distance)}</span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {washroom.amenities?.map((amenity, index) => (
            <span 
              key={index}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
            >
              {amenity}
            </span>
          ))}
        </div>

        {/* Report Button */}
        <button
          onClick={handleReport}
          disabled={isReporting || reportSuccess}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
            reportSuccess
              ? 'bg-green-100 text-green-700'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <Flag className="w-3 h-3" />
          {reportSuccess ? 'Reported' : 'Report'}
        </button>
      </div>
    </div>
  );
};

export default WashroomCard;
