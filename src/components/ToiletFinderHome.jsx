import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, User, LogIn } from 'lucide-react';
import WashroomCard from './WashroomCard';
import UserProfile from './UserProfile';
import SignInPrompt from './SignInPrompt';
import { signInWithGoogle, getCurrentUser, onAuthStateChanged } from '../services/authService';
import { getCurrentLocation, sortWashroomsByDistance } from '../services/locationService';

const ToiletFinderHome = ({ onAddWashroom, washrooms, refreshWashrooms }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [sortedWashrooms, setSortedWashrooms] = useState(washrooms);
  const [filteredWashrooms, setFilteredWashrooms] = useState(washrooms);
  const [sortBy, setSortBy] = useState('distance'); // 'distance' or 'rating'

  // Search and filter function
  const filterWashrooms = (washrooms, query) => {
    if (!query.trim()) return washrooms;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return washrooms.filter(washroom => {
      const name = washroom.name.toLowerCase();
      const address = washroom.address.toLowerCase();
      
      // Check if all search terms are found in either name or address
      return searchTerms.every(term => 
        name.includes(term) || address.includes(term)
      );
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    updateLocation();
  }, []);

  // Effect for sorting washrooms
  useEffect(() => {
    let sorted = [...washrooms];
    
    if (sortBy === 'distance' && userLocation) {
      sorted = sortWashroomsByDistance(washrooms, userLocation);
    } else if (sortBy === 'rating') {
      sorted = [...washrooms].sort((a, b) => b.rating - a.rating);
    }
    
    setSortedWashrooms(sorted);
  }, [washrooms, userLocation, sortBy]);

  // Effect for searching/filtering washrooms
  useEffect(() => {
    const filtered = filterWashrooms(sortedWashrooms, searchQuery);
    setFilteredWashrooms(filtered);
  }, [sortedWashrooms, searchQuery]);

  const updateLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleProfileClick = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error('Error signing in:', error);
      }
    } else {
      setShowProfile(true);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Update location and refresh washrooms in parallel
      await Promise.all([
        updateLocation(),
        refreshWashrooms()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setShowSignInPrompt(false);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  // Prevent add washroom if not logged in
  const handleAddWashroom = () => {
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }
    onAddWashroom();
  };

  if (showProfile && user) {
    return <UserProfile onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {showSignInPrompt && (
        <SignInPrompt
          onClose={() => setShowSignInPrompt(false)}
          onSignIn={handleSignIn}
        />
      )}
      {/* Header Section */}
      <div className="bg-[oklch(60%_0.118_184.704)] shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header with Title and Profile */}
          <div className="relative mb-8">
            {/* Main Title - Centered */}
            <h1 className="text-5xl md:text-6xl font-bold text-center text-white drop-shadow-md">
              FlushFinder
            </h1>
            
            {/* Profile Picture - Top Right */}
            <div className="absolute top-0 right-0">
              {user ? (
                <button 
                  onClick={handleProfileClick}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                >
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full rounded-full object-cover border-2 border-white shadow-md"
                  />
                </button>
              ) : (
                <button 
                  onClick={handleProfileClick}
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200 group"
                >
                  <User className="w-6 h-6 text-white group-hover:text-white" />
                </button>
              )}
            </div>
          </div>
          
          {/* Search Bar and Add Button */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-white/50 text-lg bg-white/10 text-white placeholder-white/70"
                />
              </div>
            </div>
            
            <button
              onClick={handleAddWashroom}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 border-2 border-white/30"
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
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Nearby Washrooms</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWashrooms.map(washroom => (
            <WashroomCard 
              key={washroom.id} 
              washroom={washroom}
              distance={washroom.distance}
              onClick={() => {
                // Add click handler for future functionality
                console.log('Washroom clicked:', washroom.name);
              }}
            />
          ))}
        </div>
        
        {filteredWashrooms.length === 0 && washrooms.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No washrooms match your search</h3>
            <p className="text-gray-500">Try different keywords or clear your search</p>
          </div>
        )}

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

export default ToiletFinderHome;
