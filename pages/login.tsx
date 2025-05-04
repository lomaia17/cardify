import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { signIn, useSession } from "next-auth/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard"); // Redirect to dashboard if user is logged in
    }
  }, [status, router]);

  // Handle email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect to the dashboard after successful login
    } catch (err: any) {
      setError("Login failed. Please check your credentials.");
    }
  };

  // Handle LinkedIn login
  const handleLinkedInLogin = async () => {
    try {
      const result = await signIn("linkedin", { redirect: false }); // Don't redirect automatically
      if (result?.error) {
        setError("LinkedIn login failed. Please try again.");
      } else {
        // You can check if the session is properly set here
        if (status === "authenticated") {
          router.push("/dashboard"); // Redirect to the dashboard after successful login
        } else {
          setError("An error occurred. Please try again.");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">🔐 Login</h2>

        {/* Email/Password Login Form */}
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

        {/* LinkedIn Login Button */}
        <button
          onClick={handleLinkedInLogin}
          className="w-full mt-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold py-3 rounded-xl cursor-pointer"
        >
          Login with LinkedIn
        </button>

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
