// utils/fetchCardData.ts
import { db } from "./firebaseConfig";
import { query, collection, where, getDocs } from "firebase/firestore";

export const fetchCardData = async (slug: string) => {
  console.log("Fetching card data for slug:", slug);  // Debugging log
  try {
    const q = query(collection(db, "cards"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const cardData = querySnapshot.docs[0].data();
      return cardData;
    } else {
      console.error("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching card data:", error);
    return null;
  }
};
