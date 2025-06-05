import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY in environment variables');
}
if (!process.env.FIREBASE_STORAGE_BUCKET) {
  throw new Error('Missing FIREBASE_STORAGE_BUCKET in environment variables');
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');


const adminApp = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    })
  : getApp();
const adminDb = getFirestore(adminApp);
const bucket = getStorage(adminApp).bucket();

export { adminDb as db, bucket };
