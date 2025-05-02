// pages/card/[slug].tsx
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Card from "../../components/Card";
import { fetchCardData } from "../../utils/fetchCardData";

const CardPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [cardData, setCardData] = useState<any | null>(null);

  useEffect(() => {
    if (slug) {
      const getData = async () => {
        const data = await fetchCardData(slug as string);
        setCardData(data);
      };
      getData();
    }
  }, [slug]);

  if (!cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-indigo-100 to-white flex items-center justify-center">
        <div className="text-center bg-white/80 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm text-gray-700 text-lg font-medium">
          Loading card details...
        </div>
      </div>
    );
  }

  const fullName = `${cardData.firstName} ${cardData.lastName}`;
  const finalCardData = {
    ...cardData,
    fullName,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100">
      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-3xl">
          <Card cardData={finalCardData} />
        </div>
      </div>
    </div>
  );
};

export default CardPage;
