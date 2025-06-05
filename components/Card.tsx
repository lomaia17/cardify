import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../utils/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  EnvelopeIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { QRCode } from 'react-qrcode-logo';

interface SocialLink {
  platform: string;
  url: string;
}

interface CardData {
  fullName?: string;
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  company?: string;
  linkedin?: string;
  slug?: string;
  cardStyles?: CardStyles;
  profileImage?: string;
  socialLinks?: SocialLink[];
}

interface CardStyles {
  backgroundColor: string;
  textColor: string;
  iconColor: string;
}

interface CardProps {
  cardData?: CardData | null;
}

const Card = ({ cardData: propCardData }: CardProps) => {
  const router = useRouter();
  const { slug } = router.query;

  const [cardData, setCardData] = useState<CardData | null>(propCardData || null);
  const [loading, setLoading] = useState(!propCardData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      if (propCardData || !slug) return;
      setLoading(true);
      try {
        const q = query(collection(db, "cards"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setCardData(querySnapshot.docs[0].data() as CardData);
        } else {
          setError("No card found with that slug.");
        }
      } catch (err) {
        setError("Error fetching card data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [slug, propCardData]);

  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;

  const handleAddToWallet = async () => {
    try {
      const response = await fetch(`/api/generate-pass/${slug}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to fetch pass");

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

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!cardData) return null;

  const style = cardData.cardStyles || {
    backgroundColor: "bg-white/80",
    textColor: "text-gray-800",
    iconColor: "text-indigo-500",
  };

  return (
    <div className={`${style.backgroundColor} backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-8 w-full space-y-6`}>
      <div className="text-center">
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden shadow-lg">
          {cardData.profileImage ? (
            <img src={cardData.profileImage} alt={cardData.fullName || "Profile"} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${style.backgroundColor} text-white text-3xl font-bold`}>
              {cardData.fullName?.[0] || "?"}
            </div>
          )}
        </div>
        <h2 className={`mt-4 text-2xl font-bold ${style.textColor}`}>
          {cardData.fullName || cardData.name || "No Name Available"}
        </h2>
        <p className={`text-sm text-gray-500 ${style.textColor}`}>
          {cardData.title || "No Title Available"}
        </p>
      </div>

      <div className="space-y-4 text-sm">
        {cardData.email && (
          <div className={`flex items-center ${style.textColor}`}>
            <EnvelopeIcon className={`h-5 w-5 mr-3 ${style.iconColor}`} />
            <span>{cardData.email}</span>
          </div>
        )}
        {cardData.phone && (
          <div className={`flex items-center ${style.textColor}`}>
            <PhoneIcon className={`h-5 w-5 mr-3 ${style.iconColor}`} />
            <span>{cardData.phone}</span>
          </div>
        )}
        {cardData.company && (
          <div className={`flex items-center ${style.textColor}`}>
            <BriefcaseIcon className={`h-5 w-5 mr-3 ${style.iconColor}`} />
            <span>{cardData.company}</span>
          </div>
        )}
        <div className={`flex items-center ${style.textColor}`}>
          <BuildingOfficeIcon className={`h-5 w-5 mr-3 ${style.iconColor}`} />
          <span>Business</span>
        </div>

        {Array.isArray(cardData.socialLinks) && cardData.socialLinks.length > 0 && (
          <div className="mt-4 space-y-2">
            {cardData.socialLinks.map((link, index) =>
              link.platform && link.url ? (
                <div key={index} className="flex items-center space-x-2">
                  <span className={`text-sm ${style.iconColor}`}>{link.platform}:</span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline break-all ${style.textColor}`}
                  >
                    {link.url}
                  </a>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>

      {isDesktop && slug && (
        <div className="flex justify-center mt-6">
          <QRCode
            value={`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-pass/${slug}`}
            size={160}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>
      )}

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
