import React, { useState, useEffect } from 'react';
import ToiletFinderHome from './components/ToiletFinderHome';
import AddWashroom from './components/AddWashroom';
import { getWashrooms } from './services/washroomService';

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