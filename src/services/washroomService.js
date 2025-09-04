import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Upload images to Firebase Storage
export const uploadImages = async (images) => {
  const imageUrls = [];
  for (const image of images) {
    const imageRef = ref(storage, `washroom-images/${Date.now()}-${image.file.name}`);
    const uploadResult = await uploadBytes(imageRef, image.file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    imageUrls.push(downloadURL);
  }
  return imageUrls;
};

// Add a new washroom to Firestore
export const addWashroom = async (washroomData) => {
  const docRef = await addDoc(collection(db, 'washrooms'), washroomData);
  return { id: docRef.id, ...washroomData };
};

// Get all washrooms from Firestore
export const getWashrooms = async () => {
  const q = query(collection(db, 'washrooms'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Report a washroom
export const reportWashroom = async (washroomId, reporterId = 'anonymous') => {
  const reportData = {
    washroomId,
    reporterId,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  await addDoc(collection(db, 'reports'), reportData);
};
