// pages/cards.tsx

import { useEffect, useState } from "react";
import { useFirebaseAuth } from "../utils/useFirebaseAuth";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import {
  db,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "../utils/firebaseConfig";
import Link from "next/link";
import { TrashIcon, PencilIcon, EyeIcon } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

export default function Dashboard() {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  const [cards, setCards] = useState<any[]>([]);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setFirstName(userData.firstName);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    const fetchCards = async () => {
      try {
        const q = query(
          collection(db, "cards"),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);
        const cardsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCards(cardsList);
      } catch (error) {
        console.error("Failed to fetch cards:", error);
      } finally {
        setCardsLoading(false);
      }
    };

    fetchUserInfo();
    fetchCards();
  }, [user, loading]);

  const openModal = (id: string) => {
    setCardToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCardToDelete(null);
  };

  const handleDelete = async () => {
    if (!cardToDelete) return;
    try {
      await deleteDoc(doc(db, "cards", cardToDelete));
      setCards((prev) => prev.filter((card) => card.id !== cardToDelete));
    } catch (error) {
      console.error("Error deleting card:", error);
    } finally {
      closeModal();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  return (
    <>
      <NextSeo
        title="Dashboard"
        description="Create your personalized digital business card in seconds."
        canonical="https://yourwebsite.com"
        openGraph={{
          url: "https://yourwebsite.com",
          title: "Digital Business Card Generator",
          description:
            "Create your personalized digital business card in seconds.",
          images: [
            {
              url: "../ogimage.png",
              alt: "OG Image",
            },
          ],
          site_name: "Cardify",
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
        <DashboardHeader firstName={firstName} />

        {cardsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/40 p-6 rounded-2xl border border-white/30 shadow-lg animate-pulse"
              >
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
                <div className="flex justify-end gap-3 mt-4">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          <p className="text-gray-600 text-center mt-12 text-lg">
            🚫 No cards yet!
            <br />
            Click{" "}
            <span className="text-purple-600 font-semibold">
              “Create Card”
            </span>{" "}
            to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white/40 p-6 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:shadow-xl cursor-pointer"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {card.firstName} {card.lastName}
                </h2>
                <p className="text-gray-600">
                  {card.title} at {card.company}
                </p>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => router.push(`/card/${card.slug}`)}
                    title="View Card"
                    className="cursor-pointer"
                  >
                    <EyeIcon className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                  </button>
                  <button
                    onClick={() =>  router.push(`/edit-card/${card.slug}`)}
                    title="Edit Card"
                    className="cursor-pointer"
                  >
                    <PencilIcon className="w-5 h-5 text-yellow-600 hover:text-yellow-800" />
                  </button>
                  <button
                    onClick={() => openModal(card.id)}
                    title="Delete Card"
                    className="cursor-pointer"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600 hover:text-red-800" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Confirm Deletion
              </h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this card?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={closeModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
