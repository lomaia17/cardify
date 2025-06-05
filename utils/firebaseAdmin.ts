import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

const adminApp = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccount),
      storageBucket: "r2-businesscard.appspot.com", // use correct bucket
    })
  : getApp();

const adminDb = getFirestore(adminApp);
const bucket = getStorage(adminApp).bucket();

export { adminDb as db, bucket };
