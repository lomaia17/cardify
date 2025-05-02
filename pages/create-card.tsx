import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router"; // Import Next.js router for redirection
import { db, collection, addDoc } from  "../utils/firebaseConfig"; // Import Firebase database
import { useAuth } from "../context/AuthContext";
import DashboardHeader from "../components/DashboardHeader";

import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  BriefcaseIcon,
  Building2Icon,
  LinkedinIcon,
} from "lucide-react";

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  phone: string;
  linkedin?: string;
}

const CreateCard = () => {

  // Redirect if not logged in
  const { user } = useAuth();
  useEffect(() => {
    if (!user) router.push("/"); 
  }, [user]);

  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    company: "",
    phone: "",
    linkedin: "",
  });
  const router = useRouter(); // Initialize router
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!user) return;
  
    try {
      const userRef = await addDoc(collection(db, "cards"), {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: user.email, // use logged-in user's email
        title: userInfo.title,
        company: userInfo.company,
        phone: userInfo.phone,
        linkedin: userInfo.linkedin,
      });
  
      router.push(`/card/${userRef.id}`);
    } catch (error) {
      console.error("Error saving user data: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100">
        <div className="p-6">
          <DashboardHeader firstName="" />
        </div>
      <div className="min-h-screen flex items-start justify-center py-12 px-4">
        <div className="flex flex-col md:flex-row items-start justify-center gap-10 w-full max-w-6xl">
          <form
            onSubmit={handleSubmit}
            className="w-full md:w-1/2 bg-white/30 backdrop-blur-xl shadow-2xl border border-white/20 rounded-3xl p-10 space-y-6 transition-transform duration-300 hover:scale-[1.02]"
          >
            <h2 className="text-3xl font-bold text-gray-800 text-center tracking-tight">
              ✨ Create Your Digital Business Card
            </h2>

            {[ 
              { name: "firstName", placeholder: "First Name", icon: UserIcon },
              { name: "lastName", placeholder: "Last Name", icon: UserIcon },
              { name: "email", placeholder: "Email", icon: MailIcon },
              { name: "title", placeholder: "Title", icon: BriefcaseIcon },
              { name: "company", placeholder: "Company", icon: Building2Icon },
              { name: "phone", placeholder: "Phone", icon: PhoneIcon },
              { name: "linkedin", placeholder: "LinkedIn URL", icon: LinkedinIcon },
            ].map(({ name, placeholder, icon: Icon }) => (
              <div className="relative" key={name}>
                <input
                  type={name === "email" ? "email" : "text"}
                  name={name}
                  placeholder={placeholder}
                  value={(userInfo as any)[name]}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                />
                <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
              disabled={isSubmitting} // Disable the button while submitting
            >
              {isSubmitting ? "🚀 Generating Card..." : "🚀 Generate Card"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCard;
