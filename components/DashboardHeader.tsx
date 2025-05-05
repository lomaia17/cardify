import Link from "next/link";
import { PlusIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/router";
import { getAuth, signOut as firebaseSignOut } from "firebase/auth";
import { signOut as nextAuthSignOut, useSession } from "next-auth/react"; // ✅ Add useSession

export default function DashboardHeader({ firstName }: { firstName: string | null }) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      // ✅ Sign out from Firebase (if user is authenticated)
      const firebaseAuth = getAuth();
      if (firebaseAuth.currentUser) {
        await firebaseSignOut(firebaseAuth);
      }

      // ✅ Sign out from NextAuth (if session exists)
      if (session) {
        await nextAuthSignOut({ redirect: false });
      }

      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center mb-8 py-4">
      <Link href="/dashboard" className="mb-4 sm:mb-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
          🎛️ {firstName ? `${firstName}'s Cards` : "Create Card"}
        </h1>
      </Link>

      <nav className="flex items-center gap-4 mt-4 sm:mt-0">
        <Link
          href="/create-card"
          className="inline-flex items-center gap-1 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition"
        >
          <PlusIcon className="w-4 h-4" /> Create Card
        </Link>
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
