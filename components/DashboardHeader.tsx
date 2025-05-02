// components/DashboardHeader.tsx
import Link from "next/link";
import { PlusIcon, LogOutIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

export default function DashboardHeader({ firstName }: { firstName: string | null }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();        // Call logout from context
      router.push("/"); // Redirect to home page
    } catch (error) {
      console.error("Logout failed:", error);
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
          onClick={handleLogout}
          className="inline-flex items-center gap-1 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition cursor-pointer"
        >
          <LogOutIcon className="w-4 h-4" /> Logout
        </button>
      </nav>
    </header>
  );
}
