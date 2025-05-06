import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../utils/firebaseConfig"; // adjust path as needed
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  EnvelopeIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  LinkIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

// Define the type for card data
interface CardData {
  fullName?: string;
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  company?: string;
  linkedin?: string;
  slug?: string;
}

// Define CardProps interface
interface CardProps {
  cardData?: CardData | null; // Make cardData optional for parent to pass down
}

const Card = ({ cardData }: CardProps) => {
  const router = useRouter();
  const { slug } = router.query; // Get the slug from the URL

  // If no cardData is passed as prop, fetch the data using the slug in the URL
  if (!cardData && slug) {
    const [fetchedCardData, setFetchedCardData] = useState<CardData | null>(
      null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchCardData = async () => {
        if (!slug) {
          setError("No slug found in the URL.");
          setLoading(false);
          return;
        }

        try {
          const q = query(collection(db, "cards"), where("slug", "==", slug)); // Query by slug
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            setFetchedCardData(querySnapshot.docs[0].data() as CardData);
          } else {
            setError("No card found with that slug.");
          }
        } catch (err) {
          setError("Error fetching card data.");
          console.error("Error fetching card data:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchCardData();
    }, [slug]); // Re-run effect if slug changes

    // Loading and error handling for fetching data
    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error)
      return <div className="text-center mt-10 text-red-500">{error}</div>;

    // Use fetched data if cardData is not passed in
    cardData = fetchedCardData;
  }

  const handleAddToWallet = async () => {
    try {
      const response = await fetch(`/api/generate-pass/${slug}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pass");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "businessCard.pkpass";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading pass:", error);
    }
  };

  // If no cardData is available, return null
  if (!cardData) return null;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-8 w-full space-y-6 transition duration-300 hover:shadow-blue-200">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {cardData.fullName ? cardData.fullName[0] : "?"}
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          {cardData.fullName || cardData.name || "No Name Available"}
        </h2>
        <p className="text-sm text-gray-500">
          {cardData.title || "No Title Available"}
        </p>
      </div>

      <div className="space-y-4 text-sm">
        {cardData.email && (
          <div className="flex items-center text-gray-600">
            <EnvelopeIcon className="h-5 w-5 mr-3 text-indigo-500" />
            <span>{cardData.email}</span>
          </div>
        )}
        {cardData.phone && (
          <div className="flex items-center text-gray-600">
            <PhoneIcon className="h-5 w-5 mr-3 text-indigo-500" />
            <span>{cardData.phone}</span>
          </div>
        )}
        {cardData.company && (
          <div className="flex items-center text-gray-600">
            <BriefcaseIcon className="h-5 w-5 mr-3 text-indigo-500" />
            <span>{cardData.company}</span>
          </div>
        )}
        <div className="flex items-center text-gray-600">
          <BuildingOfficeIcon className="h-5 w-5 mr-3 text-indigo-500" />
          <span>Business</span>
        </div>
        {cardData.linkedin && (
          <a
            href={cardData.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-300 ease-in-out transform hover:scale-101"
          >
            <LinkIcon className="w-5 h-5 mr-2" />
            <span>View LinkedIn Profile</span>
          </a>
        )}
      </div>

      <button
        onClick={handleAddToWallet}
        className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-md hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
      >
        <WalletIcon className="w-5 h-5" />
        <span>Add to Wallet</span>
      </button>
    </div>
  );
};

export default Card;
