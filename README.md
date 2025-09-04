# Toilet Finder App

A React application for finding and adding washroom locations with Google Maps integration.

- Full Stack Experience
   - Frontend: React - Tailwind
   - Backend/Database: Firebase
   - Authentication, file storage, and deployment

- Potential Issues:
   - Fake/Troll content. Implemented reporting system to try and combat 
   - Uses firebase blaze plan, possible storage limits
   - Data quality. Sparse/empty dataset | preloaded seed data used to demo functionality

## Features

- Google Maps Places API integration for address autocomplete
- Add new washroom locations with photos, ratings, and amenities
- Firebase integration for data storage
- Modern UI with Tailwind CSS

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the API key to your `.env` file as `VITE_GOOGLE_MAPS_API_KEY`

### 3. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Add a web app to your project
4. Copy the configuration values to your `.env` file

### 4. Installation

```bash
npm install
npm run dev
```

## Google Maps Autocomplete

The app uses Google Maps Places API to provide address autocomplete functionality. When adding a new washroom:

1. Start typing in the address field
2. Google Maps will show suggestions as you type
3. Select a legitimate address from the dropdown
4. The app will automatically extract coordinates and place details
5. Only verified Google Maps addresses are accepted

## Development

This project uses:
- React with Vite for fast development
- Tailwind CSS for styling
- Firebase for backend services
- Google Maps JavaScript API for location services
