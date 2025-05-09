// Define your colorOptions array
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
  }
];


import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import {
  db,
  collection,
  addDoc,
  getAuth,
  onAuthStateChanged,
  User,
  doc,
  getDoc,
} from "../utils/firebaseConfig";
import DashboardHeader from "../components/DashboardHeader";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  BriefcaseIcon,
  Building2Icon,
  LinkedinIcon,
} from "lucide-react";
import { EnvelopeIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { ClipLoader } from "react-spinners";
import { NextSeo } from "next-seo";
import slugify from "slugify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  phone: string;
  linkedin?: string;
  profileImage?: string;
}

const CreateCard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    company: "",
    phone: "",
    linkedin: "",
    profileImage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Default cardStyles now uses Tailwind classes (using the first option as default)
  const [cardStyles, setCardStyles] = useState({
    backgroundColor: colorOptions[0].value.backgroundColor,
    textColor: colorOptions[0].value.textColor,
    iconColor: colorOptions[0].value.iconColor,
  });
  const storage = getStorage();

  // Update user info on authentication
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: User | null) => {
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
              setUserInfo((prev) => ({
                ...prev,
                email: firebaseUser.email || "",
              }));
            }
          } catch (err) {
            console.error("Error fetching user document: ", err);
          }
        } else {
          router.push("/");
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);

    const storageRef = ref(storage, `profileImages/${user?.uid}/${file.name}`);
    try {
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Error uploading image", error);
          toast.error("Image upload failed.");
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUserInfo((prev) => ({
            ...prev,
            profileImage: downloadURL,
          }));
          toast.success("Profile image uploaded!");
        }
      );
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };

  const handleColorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    // The option value is the index of the colorOptions array
    const selectedIndex = parseInt(e.target.value, 10);
    const selectedColorOption = colorOptions[selectedIndex].value;
    setCardStyles({
      backgroundColor: selectedColorOption.backgroundColor,
      textColor: selectedColorOption.textColor,
      iconColor: selectedColorOption.iconColor,
    });
  };

  const validateForm = () => {
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.email) {
      toast.warn("First name, last name, and email are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
  
    try {
      let baseSlug = slugify(`${userInfo.firstName}-${userInfo.lastName}`, {
        lower: true,
      });
      let slug = baseSlug;
      let counter = 1;
  
      // Check if the slug already exists in Firestore
      const cardsCollectionRef = collection(db, "cards");
      let slugExists = true;
  
      while (slugExists) {
        const querySnapshot = await import("firebase/firestore").then(({ query, where, getDocs }) =>
          getDocs(query(cardsCollectionRef, where("slug", "==", slug)))
        );
  
        if (querySnapshot.empty) {
          slugExists = false;
        } else {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
  
      const docRef = await addDoc(cardsCollectionRef, {
        ...userInfo,
        cardStyles, // saving selected styles along with card data
        email: user.email,
        slug,
        createdAt: new Date(),
      });
  
      toast.success("Card created successfully!");
      router.push(`/card/${slug}`);
    } catch (error) {
      console.error("Error saving user data: ", error);
      toast.error("Failed to create card.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader size={50} color="#4f46e5" />
      </div>
    );

  return (
    <>
      <NextSeo
        title="Create Card"
        description="Create your personalized digital business card in seconds."
        canonical="https://yourwebsite.com"
        openGraph={{
          url: "https://yourwebsite.com",
          title: "Digital Business Card Generator",
          description: "Create your personalized digital business card in seconds.",
          images: [
            {
              url: "../ogimage.png",
              alt: "OG Image",
            },
          ],
          site_name: "Cardify",
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100">
        <div className="p-6">
          <DashboardHeader firstName={userInfo.firstName} />
        </div>
        <div className="min-h-screen flex flex-col md:flex-row items-start justify-center px-4 gap-10">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="w-full md:w-1/2 bg-white/30 backdrop-blur-xl shadow-2xl border border-white/20 rounded-3xl p-10 space-y-6"
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
                  value={(userInfo as any)[name]}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
                <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            ))}

            {/* Color Options Dropdown */}
            <div className="space-y-2">
              <label htmlFor="colorOptions" className="block text-sm font-medium text-gray-700">
                Choose Card Color Option
              </label>
              <select
                id="colorOptions"
                onChange={handleColorChange}
                className="w-full border border-gray-300 rounded-xl py-2 px-3 bg-white/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {colorOptions.map((option, index) => (
                  <option value={index} key={index}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* IMAGE PREVIEW */}
            <div className="relative">
              <label htmlFor="file-upload" className="block text-sm mb-2">
                {imagePreview ? (
                  <div className="w-full h-32 bg-gray-200 rounded-xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-gray-500">Upload Profile Image</span>
                  </div>
                )}
              </label>
              <input
                id="file-upload"
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
            >
              {isSubmitting ? "🚀 Generating Card..." : "🚀 Generate Card"}
            </button>
          </form>

          {/* PREVIEW CARD */}
          <div className="md:block w-full md:w-1/2 p-6">
            <div
              className={`p-6 rounded-3xl shadow-2xl max-w-md mx-auto ${cardStyles.backgroundColor}`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold shadow-lg overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="User"
                      className="w-24 h-24 object-cover rounded-full shadow-lg"
                    />
                  ) : (
                    <div className={`${cardStyles.backgroundColor} flex items-center justify-center w-full h-full`}>
                      {userInfo.firstName ? userInfo.firstName[0] : "?"}
                    </div>
                  )}
                </div>
                <h2 className={`text-2xl font-bold text-center ${cardStyles.textColor}`}>
                  {userInfo.firstName} {userInfo.lastName}
                </h2>
                <p className="text-indigo-600 font-medium">{userInfo.title}</p>
              </div>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Building2Icon className={`w-5 h-5 ${cardStyles.iconColor}`} />
                  <span className={cardStyles.textColor}>{userInfo.company}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className={`w-5 h-5 ${cardStyles.iconColor}`} />
                  <span className={cardStyles.textColor}>{userInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className={`w-5 h-5 ${cardStyles.iconColor}`} />
                  <span className={cardStyles.textColor}>{userInfo.email}</span>
                </div>
                {userInfo.linkedin && (
                  <div className="flex items-center space-x-2">
                    <LinkedinIcon className={`w-5 h-5 ${cardStyles.iconColor}`} />
                    <a
                      href={userInfo.linkedin}
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

export default CreateCard;
