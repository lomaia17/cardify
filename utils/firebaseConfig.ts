import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider , setPersistence, browserLocalPersistence} from "firebase/auth";
import { getFirestore, collection, addDoc  , getDocs, query, where , deleteDoc , doc} from "firebase/firestore";

// Firebase configuration from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyAhLdC5DkxeJ3eg4Yvm7drV1ySNCgOQoa8",
    authDomain: "business-card-761a2.firebaseapp.com",
    projectId: "business-card-761a2",
    storageBucket: "business-card-761a2.firebasestorage.app",
    messagingSenderId: "879115763102",
    appId: "1:879115763102:web:253aee58a322cf55332a8f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
setPersistence(auth, browserLocalPersistence);
const provider = new GoogleAuthProvider();

export { db , collection, addDoc , auth, provider ,getDocs, query, where , deleteDoc , doc };
