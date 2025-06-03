import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider , setPersistence, browserLocalPersistence , onAuthStateChanged, User} from "firebase/auth";
import { getFirestore, collection, addDoc  , getDocs, query, where , deleteDoc , doc, getDoc} from "firebase/firestore";

// Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDmyd7hsxqmp99GdOruHVKmdp7LKB5bPco",
  authDomain: "r2-businesscard.firebaseapp.com",
  projectId: "r2-businesscard",
  storageBucket: "r2-businesscard.firebasestorage.app",
  messagingSenderId: "158464506372",
  appId: "1:158464506372:web:67499dee6f77498da0d351"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Now authentication methods can be called
    // For example, trigger sign-in method if required
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

export { db , collection, addDoc , auth ,getDocs, query, where , deleteDoc , doc , getDoc, getAuth, onAuthStateChanged};
export type { User };