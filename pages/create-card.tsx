import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import { db, collection, addDoc, getAuth, onAuthStateChanged, User, doc , getDoc  } from "../utils/firebaseConfig";
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
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // Firebase user
  const [loading, setLoading] = useState(true);

  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    company: "",
    phone: "",
    linkedin: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check Firebase auth state
  useEffect(() => {
    const auth = getAuth();
  
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);
  
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
  
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserInfo((prev) => ({
              ...prev,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              phone: data.phone || "",
              email: data.email || firebaseUser.email || "",
            }));
          } else {
            // fallback to just auth email if Firestore doc doesn't exist
            setUserInfo((prev) => ({
              ...prev,
              email: firebaseUser.email || "",
            }));
          }
        } catch (err) {
          console.error("Error fetching user document: ", err);
        }
      } else {
        router.push("/"); // Not logged in
      }
  
      setLoading(false);
    });
  
    return () => unsubscribe(); // Clean up
  }, [router]);

  // Input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  // Form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user?.email) {
      console.error("User not authenticated");
      setIsSubmitting(false);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "cards"), {
        ...userInfo,
        email: user.email,
      });

      router.push(`/card/${docRef.id}`);
    } catch (error) {
      console.error("Error saving user data: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100">
      <div className="p-6">
        <DashboardHeader firstName={userInfo.firstName} />
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
              disabled={isSubmitting}
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
