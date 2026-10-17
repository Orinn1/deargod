import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCkrqzgNX0cy8u7SeuZsMZP4-11ADsQCFo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "deargod-6060e.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "deargod-6060e",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "deargod-6060e.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "991140697212",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:991140697212:web:222866f4fee69c9e38a5f9",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-SWHD79M1TV",
};

// Initialize Firebase App instance safely (prevent duplicate re-initialization)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore Database & Cloud Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage, firebaseConfig };
export default app;

