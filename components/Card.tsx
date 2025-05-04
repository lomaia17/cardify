import { useParams } from "react-router-dom";
import {
  UserIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const Card = ({ cardData }: { cardData: any }) => {

  if (!cardData) return null;

  const getCardIdFromUrl = () => {
    const url = window.location.href; // Get the current URL
    const regex = /\/card\/([^\/]+)/; // Match the pattern "/card/{cardId}"
    const match = url.match(regex); // Try to find the cardId in the URL
    
    if (match && match[1]) {
      return match[1]; // Return the cardId
    }
  
    return null; // If cardId is not found, return null
  };
  
  const cardId = getCardIdFromUrl();

  const handleAddToWallet = async () => {
    if (!cardId) {
      console.error("No cardId found");
      return;
    }

    try {
      const response = await fetch(`/api/generate-pass/${cardId}`, {
        method: "POST", // Ensure you're using the correct HTTP method
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pass");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "businessCard.pkpass"; // Optional: specify filename
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading pass:", error);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-8 w-full space-y-6 transition duration-300 hover:shadow-blue-200">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {cardData.fullName ? cardData.fullName[0] : "?"}
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          {cardData.fullName || cardData.name}
        </h2>
        <p className="text-sm text-gray-500">{cardData.title}</p>
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
            className="flex items-center text-indigo-600 hover:underline"
          >
            View LinkedIn Profile
          </a>
        )}
      </div>

      <button
        onClick={handleAddToWallet}
        className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
      >
        Add to Wallet
      </button>
    </div>
  );
};

export default Card;
