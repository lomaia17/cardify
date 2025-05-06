import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import { query, collection, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../utils/firebaseConfig"; // Firebase configuration
import { onAuthStateChanged, User } from "firebase/auth"; // Firebase authentication imports
import { ClipLoader } from 'react-spinners';
import { NextSeo } from "next-seo";
import Header from "../../components/cardsHeader";
import { UserIcon, MailIcon, PhoneIcon, BriefcaseIcon, Building2Icon, LinkedinIcon, Link } from "lucide-react";

// Define FormData interface with all fields
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  phone: string;
  linkedin: string;
  slug: string;
}

const EditCard = () => {
  const router = useRouter();
  const { id } = router.query; // Get the 'id' from the URL (this will be the slug passed to the page)
  
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    company: "",
    phone: "",
    linkedin: "",
    slug: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<User | null>(null); // Firebase user state

  // Check if the user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        // Redirect to home if user is not authenticated
        router.push("/");
      } else {
        setUser(firebaseUser);
      }
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, [router]);

  // Fetch card data when `id` is available and user is logged in
  useEffect(() => {
    if (!id || typeof id !== 'string' || !user?.email) {
      return; // Return early if id or user email is unavailable
    }

    const fetchCard = async () => {
      try {
        const q = query(collection(db, "cards"), where("slug", "==", id)); // Query by slug (id)
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const cardData = querySnapshot.docs[0].data();
          console.log("Fetched card data:", cardData);

          // Normalize both emails to lowercase and trim any extra spaces
          const cardEmail = cardData?.email?.toLowerCase().trim();
          const loggedInEmail = user?.email?.toLowerCase().trim();

          // Check if the card email matches the logged-in user's email
          if (cardEmail !== loggedInEmail) {
            alert("You are not authorized to edit this card.");
            router.push("/"); // Redirect to home if not authorized
            return;
          }

          // Set fetched card data into formData
          setFormData(cardData as FormData);
        } else {
          alert("Card not found.");
          router.push("/"); // Redirect if card not found
        }
      } catch (error) {
        console.error("Error fetching card:", error);
      } finally {
        setLoading(false); // Set loading to false when done fetching data
      }
    };

    fetchCard();
  }, [id, user?.email, router]);

  // Handle form input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission to update the card data
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUpdating(true);
  
    try {
      // Check if the slug already exists in the 'cards' collection
      const q = query(collection(db, "cards"), where("slug", "==", formData.slug));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // If the slug already exists, show an error or handle as needed
        alert("This slug is already taken. Please choose a different one.");
        setUpdating(false);
        return;
      }
  
      // Proceed with updating the card
      const cardQuery = query(collection(db, "cards"), where("slug", "==", id));
      const cardSnapshot = await getDocs(cardQuery);
  
      if (!cardSnapshot.empty) {
        const docRef = doc(db, "cards", cardSnapshot.docs[0].id); // Get the document reference
        await updateDoc(docRef, { ...formData }); // Update the card with the new slug and data
        router.push(`/card/${formData.slug}`); // Redirect to the new slug URL
      } else {
        alert("Card not found.");
        router.push("/");
      }
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
    return <p className="text-center py-10">Unauthorized access. Please sign in.</p>;
  }

  return (
    <>
    <NextSeo
        title="Edit Card"
        description="Create your personalized digital business card in seconds."
        canonical="https://yourwebsite.com"
        openGraph={{
          url: 'https://yourwebsite.com',
          title: 'Digital Business Card Generator',
          description: 'Create your personalized digital business card in seconds.',
          images: [
            {
              url: '../../public/ogimage.png',
              alt: 'OG Image',
            },
          ],
          site_name: 'Cardify',
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
                  value={(formData as any)[name]}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            ))}
            {[
              {
                name: "slug",
                placeholder: "Change Slug",
                icon: Link,
              },
            ].map(({ name, placeholder, icon: Icon }) => (
                            <div className="relative">
                <div className="flex items-center rounded-xl border border-gray-300 bg-white/70 text-gray-800 focus-within:ring-2 focus-within:ring-purple-400 overflow-hidden">
                  {/* Icon on the left */}
                  <Link className="ml-4 text-gray-400 w-5 h-5" />

                  {/* Static slug prefix */}
                  <span className="px-2 pr-0 text-gray-500 text-sm whitespace-nowrap">
                    {typeof window !== "undefined" ? `${window.location.origin}/card/` : ""}
                  </span>

                  {/* Input field */}
                  <input
                    type="text"
                    name="slug"
                    placeholder="your-slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="flex-1 px-2 pl-1 py-3 bg-transparent focus:outline-none"
                  />
                </div>
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
    </>
  );
};

export default EditCard;
