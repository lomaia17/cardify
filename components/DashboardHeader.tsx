// components/DashboardHeader.tsx
import Link from "next/link";
import { PlusIcon, LogOutIcon , LinkedinIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { signOut , useSession  } from "next-auth/react"; 

export default function DashboardHeader({ firstName }: { firstName: string | null }) {
  const { logout } = useAuth();
  const router = useRouter();
  const { data: session } = useSession();
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false }); // Ensure this is not redirecting automatically
      router.push("/"); // After logging out, redirect to the home page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCreateFromLinkedIn = async () => {
    try {
      const profile = session?.user;
      if (!profile || !profile.name || !profile.email) {
        alert("LinkedIn data not available.");
        return;
      }

      const [firstName, ...lastNameParts] = profile.name.split(" ");
      const lastName = lastNameParts.join(" ");
      const newCard = {
        firstName,
        lastName,
        email: profile.email,
        title: "", // LinkedIn doesn't provide this by default via next-auth
        company: "",
        phone: "",
        linkedin: profile.image, // or a default LinkedIn URL
      };

      const { db, collection, addDoc } = await import("../utils/firebaseConfig");
      const cardRef = await addDoc(collection(db, "cards"), newCard);
      router.push(`/card/${cardRef.id}`);
    } catch (error) {
      console.error("Error creating card from LinkedIn:", error);
    }
  };

  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800">
        🎛️ {firstName ? `${firstName}'s Cards` : "Create Card"}
      </h1>
      <nav className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-purple-600 hover:underline font-medium"
        >
          Dashboard
        </Link>
        <Link
          href="/create-card"
          className="inline-flex items-center gap-1 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition"
        >
          <PlusIcon className="w-4 h-4" /> Create Card
        </Link>
        <button
          onClick={handleCreateFromLinkedIn}
          className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition cursor-pointer"
        >
          <LinkedinIcon className="w-4 h-4" /> From LinkedIn
        </button>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition cursor-pointer"
        >
          <LogOutIcon className="w-4 h-4" /> Logout
        </button>
      </nav>
    </header>
  );
}
