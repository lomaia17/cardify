// pages/card/[slug].tsx
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Card from "../../components/Card";
import { fetchCardData } from "../../utils/fetchCardData";

const CardPage = () => {
  const router = useRouter();
  const { slug } = router.query; // Getting 'slug' from the URL

  const [cardData, setCardData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure that slug exists before making the fetch call
    if (slug) {
      const getData = async () => {
        setLoading(true);
        setError(null); // Reset error if slug changes
        try {
          const data = await fetchCardData(slug as string);
          if (data) {
            setCardData(data);
          } else {
            setError("Card not found");
          }
        } catch (err) {
          setError("Error fetching card data");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      getData();
    }
  }, [slug]); // Trigger fetch when slug changes

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-indigo-100 to-white flex items-center justify-center">
        <div className="text-center bg-white/80 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm text-gray-700 text-lg font-medium">
          Loading card details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-indigo-100 to-white flex items-center justify-center">
        <div className="text-center bg-white/80 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm text-gray-700 text-lg font-medium">
          {error}
        </div>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-indigo-100 to-white flex items-center justify-center">
        <div className="text-center bg-white/80 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm text-gray-700 text-lg font-medium">
          No card data found
        </div>
      </div>
    );
  }

  // Combine first name and last name to create a full name
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
