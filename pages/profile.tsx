// pages/profile.tsx
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { NextPage } from "next";

const Profile: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Please sign in to continue</h2>
      <button onClick={() => signIn("linkedin")}>Sign in with LinkedIn</button>
    </div>
  );
};

export default Profile;
