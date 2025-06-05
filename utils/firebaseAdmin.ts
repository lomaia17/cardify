import * as admin from "firebase-admin";

// Prevent re-initialization in hot-reload environments like Next.js
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "r2-businesscard",
      clientEmail: "firebase-adminsdk-fbsvc@r2-businesscard.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // e.g. r2-businesscard.appspot.com
  });
}

// Export Admin SDK services
const bucket = admin.storage().bucket();
const dbAdmin = admin.firestore();
const authAdmin = admin.auth();

export { admin, bucket, dbAdmin, authAdmin };
