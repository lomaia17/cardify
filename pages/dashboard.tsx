import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { db, collection, getDocs, query, where, deleteDoc, doc } from "../utils/firebaseConfig";
import Link from "next/link";
import { TrashIcon } from "lucide-react";
import { PencilIcon, EyeIcon, PlusIcon } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<any[]>([]);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login"); // Redirect if not logged in
    } else {
      const fetchUserInfo = async () => {
        try {
          const q = query(collection(db, "users"), where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              setFirstName(userData.firstName); // Set the first name
            });
          } else {
            console.warn("User not found in the users collection");
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      };

      const fetchCards = async () => {
        try {
          const q = query(collection(db, "cards"), where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const cardData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setCards(cardData);
          } else {
            console.warn("No cards found for this user.");
          }
        } catch (error) {
          console.error("Error fetching cards:", error);
        } finally {
          setLoading(false); // Stop loading when data is fetched
        }
      };

      fetchUserInfo();
      fetchCards();
    }
  }, [user]);

  // Open modal
  const openModal = (cardId: string) => {
    setCardToDelete(cardId);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCardToDelete(null);
  };

  const handleDelete = async () => {
    if (!cardToDelete) return;
    try {
      await deleteDoc(doc(db, "cards", cardToDelete)); // Delete from Firestore
      setCards(cards.filter((card) => card.id !== cardToDelete)); // Remove from UI
      closeModal(); // Close modal after deletion
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
      {/* Header Navigation */}
      <DashboardHeader firstName={firstName} />

      {/* Card List */}
      {loading ? (
        <p>Loading cards...</p>
      ) : cards.length === 0 ? (
        <p className="text-gray-600">You have no cards yet. Click “Create Card” to start.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {card.firstName} {card.lastName}
              </h2>
              <p className="text-gray-600">{card.title} at {card.company}</p>
              <div className="flex justify-end gap-3 mt-4">
                <Link href={`/card/${card.id}`} className="text-blue-600 hover:text-blue-800" title="View Card">
                  <EyeIcon className="w-5 h-5" />
                </Link>
                <Link
                  href={`/edit-card/${card.id}`}
                  className="text-yellow-600 hover:text-yellow-800"
                  title="Edit Card"
                >
                  <PencilIcon className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => openModal(card.id)}
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                  title="Delete Card"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this card?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
