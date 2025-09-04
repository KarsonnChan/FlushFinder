import React from 'react';
import { LogIn } from 'lucide-react';

const SignInPrompt = ({ onClose, onSignIn }) => {
  return (
    // Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {/* Modal */}
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        
        {/* Content */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="p-3 bg-blue-50 rounded-full">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in with your Google account to add washrooms to FlushFinder.
          </p>
          
          {/* Sign in button */}
          <button
            onClick={onSignIn}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
          
          {/* Skip option */}
          <button
            onClick={onClose}
            className="mt-4 text-gray-600 hover:text-gray-800 text-sm"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInPrompt;
