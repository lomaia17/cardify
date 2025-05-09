import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import {
  query,
  collection,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../../utils/firebaseConfig"; // Firebase configuration
import { onAuthStateChanged, User } from "firebase/auth"; // Firebase authentication imports
import { ClipLoader } from "react-spinners";
import { NextSeo } from "next-seo";
import Header from "../../components/DashboardHeader";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  BriefcaseIcon,
  Building2Icon,
  LinkedinIcon,
  Link,
} from "lucide-react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
const colorOptions = [
  {
    label: "Neutral Light",
    value: {
      backgroundColor: "bg-gradient-to-r from-gray-100 to-gray-300",
      textColor: "text-gray-800",
      iconColor: "text-gray-600",
    },
  },
  {
    label: "Ocean Blue",
    value: {
      backgroundColor: "bg-gradient-to-r from-blue-500 to-blue-700",
      textColor: "text-white",
      iconColor: "text-white",
    },
  },
  {
    label: "Emerald Green",
    value: {
      backgroundColor: "bg-gradient-to-r from-emerald-400 to-emerald-600",
      textColor: "text-white",
      iconColor: "text-white",
    },
  },
  {
    label: "Sunset Orange",
    value: {
      backgroundColor: "bg-gradient-to-r from-orange-400 to-red-500",
      textColor: "text-white",
      iconColor: "text-white",
    },
  },
  {
    label: "Deep Purple",
    value: {
      backgroundColor: "bg-gradient-to-r from-purple-600 to-indigo-700",
      textColor: "text-white",
      iconColor: "text-white",
    },
  },
  {
    label: "Soft Rose",
    value: {
      backgroundColor: "bg-gradient-to-r from-rose-300 to-rose-500",
      textColor: "text-white",
      iconColor: "text-white",
    },
  },
  {
    label: "Slate Gray",
    value: {
      backgroundColor: "bg-gradient-to-r from-slate-600 to-slate-800",
      textColor: "text-white",
      iconColor: "text-gray-300",
    },
  },
  {
    label: "Golden Yellow",
    value: {
      backgroundColor: "bg-gradient-to-r from-yellow-300 to-yellow-500",
      textColor: "text-gray-900",
      iconColor: "text-gray-800",
    },
  },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  phone: string;
  linkedin: string;
  slug: string;
  cardStyles: {
    backgroundColor: string;
    textColor: string;
    iconColor: string;
  };
}

const EditCard = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    company: "",
    phone: "",
    linkedin: "",
    slug: "",
    cardStyles: colorOptions[0].value,
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [slugError, setSlugError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/"); // Redirect to home if user is not authenticated
      } else {
        setUser(firebaseUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!id || typeof id !== "string" || !user?.email) {
      return;
    }

    const fetchCard = async () => {
      try {
        const q = query(collection(db, "cards"), where("slug", "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const cardData = querySnapshot.docs[0].data();

          const cardEmail = cardData?.email?.toLowerCase().trim();
          const loggedInEmail = user?.email?.toLowerCase().trim();

          if (cardEmail !== loggedInEmail) {
            alert("You are not authorized to edit this card.");
            router.push("/"); // Redirect if not authorized
            return;
          }

          setFormData(cardData as FormData);
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
  }, [id, user?.email, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleColorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = colorOptions.find((opt) => opt.label === e.target.value);
    if (selected) {
      setFormData({ ...formData, cardStyles: selected.value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const currentCardQuery = query(
        collection(db, "cards"),
        where("slug", "==", id)
      );
      const currentCardSnapshot = await getDocs(currentCardQuery);

      if (currentCardSnapshot.empty) {
        alert("Card not found.");
        router.push("/");
        return;
      }

      const currentDoc = currentCardSnapshot.docs[0];
      const currentDocId = currentDoc.id;

      const slugQuery = query(
        collection(db, "cards"),
        where("slug", "==", formData.slug)
      );
      const slugSnapshot = await getDocs(slugQuery);

      const slugTaken = slugSnapshot.docs.some(
        (doc) => doc.id !== currentDocId
      );

      if (slugTaken) {
        setSlugError(
          "This slug is already taken. Please choose a different one."
        );
        setUpdating(false);
        return;
      } else {
        setSlugError(""); // Clear any previous error
      }

      const docRef = doc(db, "cards", currentDocId);
      await updateDoc(docRef, { ...formData });
      router.push(`/card/${formData.slug}`);
    } catch (error) {
      console.error("Error updating card:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !id) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader size={50} color="#4f46e5" />
      </div>
    );
  }

  if (!user?.email) {
    return (
      <p className="text-center py-10">Unauthorized access. Please sign in.</p>
    );
  }

  return (
    <>
      <NextSeo
        title="Edit Card"
        description="Create your personalized digital business card in seconds."
        canonical="https://yourwebsite.com"
        openGraph={{
          url: "https://yourwebsite.com",
          title: "Digital Business Card Generator",
          description:
            "Create your personalized digital business card in seconds.",
          images: [
            {
              url: "../../ogimage.png",
              alt: "OG Image",
            },
          ],
          site_name: "Cardify",
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100">
        <div className="p-6">
          <Header firstName={formData.firstName || ""} />
        </div>
        <div className="min-h-screen flex items-start justify-center py-12 px-4">
          <div className="w-full max-w-2xl bg-white/30 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              🛠️ Edit Your Business Card
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                {
                  name: "firstName",
                  placeholder: "First Name",
                  icon: UserIcon,
                },
                {
                  name: "lastName",
                  placeholder: "Last Name",
                  icon: UserIcon,
                },
                {
                  name: "email",
                  placeholder: "Email",
                  icon: MailIcon,
                },
                {
                  name: "title",
                  placeholder: "Title",
                  icon: BriefcaseIcon,
                },
                {
                  name: "company",
                  placeholder: "Company",
                  icon: Building2Icon,
                },
                {
                  name: "phone",
                  placeholder: "Phone",
                  icon: PhoneIcon,
                },
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
              {[{ name: "slug", placeholder: "Change Slug", icon: Link }].map(
                ({ name, placeholder, icon: Icon }) => (
                  <div className="relative" key={name}>
                    <input
                      type="text"
                      name={name}
                      placeholder={placeholder}
                      value={(formData as any)[name]}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    {slugError && (
                      <p className="text-sm text-red-600 mt-2">{slugError}</p>
                    )}
                  </div>
                )
              )}

<div>
  <label htmlFor="colorTheme" className="block mb-2 font-medium text-gray-700">
    Select Card Theme
  </label>
  <select
    id="colorTheme"
    onChange={handleColorChange}
    className="w-full p-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
    value={
      colorOptions.find((opt) =>
        JSON.stringify(opt.value) === JSON.stringify(formData.cardStyles)
      )?.label || ""
    }
  >
    <option value="">Select a theme</option>
    {colorOptions.map((option) => (
      <option key={option.label} value={option.label}>
        {option.label}
      </option>
    ))}
  </select>
</div>

              <button
                type="submit"
                disabled={updating}
                className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition duration-300 ${
                  updating ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </form>
          </div>
                        {/* PREVIEW CARD */}
  <div className="md:block w-full md:w-1/2 p-6">
    <div
      className={`p-6 rounded-3xl shadow-2xl max-w-md mx-auto ${formData.cardStyles.backgroundColor}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold shadow-lg overflow-hidden">
            <div className={`${formData.cardStyles.backgroundColor} flex items-center justify-center w-full h-full`}>
              {formData.firstName ? formData.firstName[0] : "?"}
            </div>
        </div>
        <h2 className={`text-2xl font-bold text-center ${formData.cardStyles.textColor}`}>
          {formData.firstName} {formData.lastName}
        </h2>
        <p className="text-indigo-600 font-medium">{formData.title}</p>
      </div>
      <div className="mt-6 space-y-3 text-sm">
        <div className="flex items-center space-x-2">
          <Building2Icon className={`w-5 h-5 ${formData.cardStyles.iconColor}`} />
          <span className={formData.cardStyles.textColor}>{formData.company}</span>
        </div>
        <div className="flex items-center space-x-2">
          <PhoneIcon className={`w-5 h-5 ${formData.cardStyles.iconColor}`} />
          <span className={formData.cardStyles.textColor}>{formData.phone}</span>
        </div>
        <div className="flex items-center space-x-2">
          <EnvelopeIcon className={`w-5 h-5 ${formData.cardStyles.iconColor}`} />
          <span className={formData.cardStyles.textColor}>{formData.email}</span>
        </div>
        {formData.linkedin && (
          <div className="flex items-center space-x-2">
            <LinkedinIcon className={`w-5 h-5 ${formData.cardStyles.iconColor}`} />
            <a
              href={formData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              LinkedIn Profile
            </a>
          </div>
        )}
      </div>
    </div>
  </div>
        </div>
      </div>
    </>
  );
};

export default EditCard;
