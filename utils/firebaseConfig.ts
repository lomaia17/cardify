import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  getDownloadURL,
} from "firebase/storage"; // ✅ Storage

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDmyd7hsxqmp99GdOruHVKmdp7LKB5bPco",
  authDomain: "r2-businesscard.firebaseapp.com",
  projectId: "r2-businesscard",
  storageBucket: "r2-businesscard.appspot.com", // ✅ Correct bucket format
  messagingSenderId: "158464506372",
  appId: "1:158464506372:web:67499dee6f77498da0d351",
};

// Initialize app only if none exists
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // ✅ Storage instance

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

export {
  db,
  collection,
  addDoc,
  auth,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  getAuth,
  onAuthStateChanged,
  storage,
  ref,
  getDownloadURL, // Export for optional use
};
export type { User };
