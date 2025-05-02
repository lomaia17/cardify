import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // or wherever you want
    } catch (err: any) {
      setError("Login failed. Please check your credentials.");
    }
  };

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
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 rounded-xl cursor-pointer"
          >
            🔓 Login
          </button>
        </form>
        <p className="text-center text-sm text-gray-700">
          Don't have an account?{" "}
          <a href="/register" className="text-purple-600 font-medium hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}