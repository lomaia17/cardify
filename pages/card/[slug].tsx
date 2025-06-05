import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../../utils/firebaseConfig"; // Import Firebase config
import Card from "../../components/Card";
import { fetchCardData } from "../../utils/fetchCardData";
import DashboardHeader from "../../components/DashboardHeader";

const CardPage = () => {
  const router = useRouter();
  const { slug } = router.query; // Get 'slug' from the URL
  const [session, setSession] = useState<User | null>(null); // Local session state
  const [cardData, setCardData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use onAuthStateChanged to monitor the authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user); // Set session to the current authenticated user
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  // Fetch card data when slug changes
  useEffect(() => {
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
  }, [slug]);

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

  // Show the DashboardHeader only if the session user matches the card owner
  const showDashboardHeader = session?.email === cardData?.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100">
      {showDashboardHeader && <>  <div className="p-6">
                <DashboardHeader firstName={cardData.firstName} />
              </div></>}
      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-3xl">
          <Card cardData={finalCardData} /> {
          session && (
          <p className="text-sm text-gray-700 mt-6 text-center">
            This URL is public and will be available for anyone, feel free to share.
          </p>
        )}
        </div>
      </div>
    </div>
  );
};

export default CardPage;
