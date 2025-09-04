import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser, signOutUser } from '../services/authService';
import { ArrowLeft, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const UserProfile = ({ onBack }) => {
  const [userWashrooms, setUserWashrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [washroomToDelete, setWashroomToDelete] = useState(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadUserWashrooms();
    }
  }, [currentUser]);

  const loadUserWashrooms = async () => {
    try {
      const q = query(
        collection(db, 'washrooms'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const washrooms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserWashrooms(washrooms);
    } catch (error) {
      console.error('Error loading user washrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (washroom) => {
    setWashroomToDelete(washroom);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!washroomToDelete) return;

    try {
      await deleteDoc(doc(db, 'washrooms', washroomToDelete.id));
      setUserWashrooms(prev => prev.filter(w => w.id !== washroomToDelete.id));
      setDeleteModalOpen(false);
      setWashroomToDelete(null);
    } catch (error) {
      console.error('Error deleting washroom:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onBack();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!currentUser) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setWashroomToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        washroomName={washroomToDelete?.name || ''}
      />
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
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
          
          <div className="flex items-center">
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              className="w-16 h-16 rounded-full"
            />
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{currentUser.displayName}</h2>
              <p className="text-gray-600">{currentUser.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="mt-4 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* User's Washrooms */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">My Washrooms</h2>
          
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : userWashrooms.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              You haven't added any washrooms yet.
            </div>
          ) : (
            <div className="space-y-4">
              {userWashrooms.map(washroom => (
                <div
                  key={washroom.id}
                  className="border rounded-lg p-4 flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-semibold">{washroom.name}</h3>
                    <p className="text-sm text-gray-600">{washroom.address}</p>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: washroom.rating }).map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(washroom)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
