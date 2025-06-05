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
import { db, auth } from "../../utils/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
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

interface SocialLink {
  platform: string;
  url: string;
}

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
  socialLinks: SocialLink[];
  profileImage?: string;
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
    socialLinks: [{ platform: "", url: "" }],
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [slugError, setSlugError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const inputClasses =
    "w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/");
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
            router.push("/");
            return;
          }

          // Initialize socialLinks if it doesn't exist
          const socialLinks = cardData.socialLinks || [{ platform: "", url: "" }];
          
          setFormData({
            ...cardData,
            socialLinks,
          } as FormData);

          if (cardData.profileImage) {
            setImagePreview(cardData.profileImage);
          }
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

  const handleSocialLinkChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedLinks = [...formData.socialLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value,
    };
    setFormData({ ...formData, socialLinks: updatedLinks });
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "", url: "" }],
    }));
  };

  const removeSocialLink = (index: number) => {
    const updatedLinks = [...formData.socialLinks];
    updatedLinks.splice(index, 1);
    setFormData({ ...formData, socialLinks: updatedLinks });
  };

  const handleColorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = colorOptions.find((opt) => opt.label === e.target.value);
    if (selected) {
      setFormData({ ...formData, cardStyles: selected.value });
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    // Preview the image locally
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);

    // You would typically upload the image to storage here
    // and update the formData.profileImage with the download URL
    // Similar to the implementation in CreateCard
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
        setSlugError("");
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
        description="Edit your personalized digital business card."
        canonical="https://yourwebsite.com"
        openGraph={{
          url: "https://yourwebsite.com",
          title: "Edit Digital Business Card",
          description: "Edit your personalized digital business card.",
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
        <div className="min-h-screen flex flex-col md:flex-row items-start justify-center px-4 gap-10">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="w-full md:w-1/2 bg-white/30 backdrop-blur-xl shadow-2xl border border-white/20 rounded-3xl p-10 space-y-6"
          >
            <h2 className="text-3xl font-bold text-gray-800 text-center tracking-tight">
              🛠️ Edit Your Business Card
            </h2>

            {[
              { name: "firstName", placeholder: "First Name", icon: UserIcon },
              { name: "lastName", placeholder: "Last Name", icon: UserIcon },
              { name: "email", placeholder: "Email", icon: MailIcon },
              { name: "title", placeholder: "Title", icon: BriefcaseIcon },
              { name: "company", placeholder: "Company", icon: Building2Icon },
              { name: "phone", placeholder: "Phone", icon: PhoneIcon },
            ].map(({ name, placeholder, icon: Icon }) => (
              <div className="relative" key={name}>
                <input
                  type={name === "email" ? "email" : "text"}
                  name={name}
                  placeholder={placeholder}
                  value={(formData as any)[name]}
                  onChange={handleChange}
                  className={inputClasses}
                />
                <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            ))}

            {/* Social Links Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium">Social Links</label>
              {formData.socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Platform (e.g., LinkedIn)"
                    value={link.platform}
                    onChange={(e) =>
                      handleSocialLinkChange(index, "platform", e.target.value)
                    }
                    className={inputClasses}
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) =>
                      handleSocialLinkChange(index, "url", e.target.value)
                    }
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSocialLink}
                className="text-blue-600 underline"
              >
                + Add Another
              </button>
            </div>

            {/* Slug Input */}
            <div className="relative">
              <input
                type="text"
                name="slug"
                placeholder="Change Slug"
                value={formData.slug}
                onChange={handleChange}
                className={inputClasses}
              />
              <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              {slugError && (
                <p className="text-sm text-red-600 mt-2">{slugError}</p>
              )}
            </div>

            {/* Color Options Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="colorOptions"
                className="block text-sm font-medium text-gray-700"
              >
                Choose Card Color Option
              </label>
              <select
                id="colorOptions"
                onChange={handleColorChange}
                className="w-full border border-gray-300 rounded-xl py-2 px-3 bg-white/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={
                  colorOptions.find((opt) =>
                    JSON.stringify(opt.value) === JSON.stringify(formData.cardStyles)
                  )?.label || ""
                }
              >
                {colorOptions.map((option) => (
                  <option key={option.label} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div className="relative">
              <label htmlFor="file-upload" className="block text-sm mb-2">
                {imagePreview ? (
                  <div className="w-full aspect-[3/2] bg-gray-200 rounded-xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/2] bg-gray-200 rounded-xl flex items-center justify-center">
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
              disabled={updating}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
            >
              {updating ? "🚀 Updating Card..." : "🚀 Update Card"}
            </button>
          </form>

          {/* PREVIEW CARD */}
          <div className="md:block w-full md:w-1/2 p-6">
            <div
              className={`p-6 rounded-3xl shadow-2xl max-w-md mx-auto ${formData.cardStyles.backgroundColor}`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="User Avatar"
                      className="w-24 h-24 object-cover rounded-full shadow-lg"
                    />
                  ) : (
                    <div
                      className={`${formData.cardStyles.backgroundColor} flex items-center justify-center w-full h-full`}
                    >
                      {formData.firstName ? formData.firstName[0] : "?"}
                    </div>
                  )}
                </div>
                <h2
                  className={`text-2xl font-bold text-center ${formData.cardStyles.textColor}`}
                >
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className={`${formData.cardStyles.textColor} font-medium`}>
                  {formData.title}
                </p>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Building2Icon
                    className={`w-5 h-5 ${formData.cardStyles.iconColor}`}
                  />
                  <span className={formData.cardStyles.textColor}>
                    {formData.company}
                  </span>
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
                    <LinkedinIcon
                      className={`w-5 h-5 ${formData.cardStyles.iconColor}`}
                    />
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

              {/* Social Links Preview */}
              {formData.socialLinks?.length > 0 && (
                <div className="mt-4 space-y-2 text-sm">
                  {formData.socialLinks.map(
                    (link, index) =>
                      link.platform &&
                      link.url && (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <span className={`text-sm ${formData.cardStyles.iconColor}`}>
                            {link.platform}:
                          </span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`underline ${formData.cardStyles.textColor}`}
                          >
                            {link.url}
                          </a>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditCard;