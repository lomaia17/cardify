import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { useFirebaseAuth } from "../utils/useFirebaseAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    if (!loading && user && router.pathname === "/login") {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle redirect
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  if (loading) return null; // or show a loading spinner

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">🔐 Login</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full pl-4 pr-4 py-3 rounded-xl border bg-white/70 text-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-4 pr-4 py-3 rounded-xl border bg-white/70 text-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="text-center text-sm text-gray-700">
              Don't have an account?{" "}
              <span
                className="text-purple-600 font-semibold hover:underline cursor-pointer"
                onClick={() => router.push("/register")}
              >
                Register
              </span>
            </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 rounded-xl cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "🔓 Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
