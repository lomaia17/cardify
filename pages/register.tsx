import { useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../utils/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { NextSeo } from "next-seo";
export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Save extra user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
      });

      router.push("/create-card");
    } catch (err: any) {
      setError("Registration failed. Try another email.");
    }
  };


  return (
    <>
    <NextSeo
            title="Register"
            description="Create your personalized digital business card in seconds."
            canonical="https://yourwebsite.com"
            openGraph={{
              url: 'https://yourwebsite.com',
              title: 'Digital Business Card Generator',
              description: 'Create your personalized digital business card in seconds.',
              images: [
                {
                  url: '../ogimage.png',
                  alt: 'OG Image',
                },
              ],
              site_name: 'Cardify',
            }}
          />
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl ">
        <h2 className="text-3xl font-bold text-center text-gray-800 pb-6">📝 Register</h2>
        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={formData.phone}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
          >
            🚀 Register
          </button>
        </form>
        <p className="text-center text-sm text-gray-700 pt-6">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 font-medium hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
    </>
  );
}
