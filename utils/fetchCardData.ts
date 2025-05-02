// utils/fetchCardData.ts
import { db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export const fetchCardData = async (slug: string) => {
  try {
    const docRef = doc(db, "cards", slug); // Fetch the document with the given slug from the "cards" collection
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.error("No such document!");
      return null; // Handle if the card doesn't exist
    }
  } catch (error) {
    console.error("Error fetching card data:", error);
    return null;
  }
};
