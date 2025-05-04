// pages/card/edit/[id].tsx

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useSession } from "next-auth/react";

import Header from "../../components/DashboardHeader";

import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  BriefcaseIcon,
  Building2Icon,
  LinkedinIcon,
} from "lucide-react";

const EditCard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    company: "",
    phone: "",
    linkedin: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id || !session?.user?.email) return;

    const fetchCard = async () => {
      try {
        const docRef = doc(db, "cards", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          if (
            !data?.email ||
            data.email.toLowerCase() !== session.user.email.toLowerCase()
          ) {
            alert("You are not authorized to edit this card.");
            router.push("/");
            return;
          }

          setFormData(data as any);
        } else {
          alert("Card not found.");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching card:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id, session?.user?.email]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const docRef = doc(db, "cards", id as string);
      await updateDoc(docRef, formData);
      router.push(`/card/${id}`);
    } catch (error) {
      console.error("Error updating card:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || status === "loading") {
    return <p className="text-center py-10">Loading card...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100">
      <Header firstName={formData.firstName || ""} />
      <div className="min-h-screen flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-2xl bg-white/30 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🛠️ Edit Your Business Card
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { name: "firstName", placeholder: "First Name", icon: UserIcon },
              { name: "lastName", placeholder: "Last Name", icon: UserIcon },
              { name: "email", placeholder: "Email", icon: MailIcon },
              { name: "title", placeholder: "Title", icon: BriefcaseIcon },
              { name: "company", placeholder: "Company", icon: Building2Icon },
              { name: "phone", placeholder: "Phone", icon: PhoneIcon },
              {
                name: "linkedin",
                placeholder: "LinkedIn URL",
                icon: LinkedinIcon,
              },
            ].map(({ name, placeholder, icon: Icon }) => (
              <div className="relative" key={name}>
                <input
                  type={name === "email" ? "email" : "text"}
                  name={name}
                  placeholder={placeholder}
                  value={(formData as any)[name]}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
              disabled={updating}
            >
              {updating ? "Updating..." : "💾 Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCard;
