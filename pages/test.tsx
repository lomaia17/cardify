'use client';
import { getServerSession } from "next-auth";
import authOptions from "./api/auth/[...nextauth]"; 

async function getLinkedInProfile(accessToken) {
  try {
    const response = await fetch("https://api.linkedin.com/v2/me?projection=(headline,positions)", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      console.error("Failed to fetch LinkedIn profile:", response.status, response.statusText);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching LinkedIn profile:", error);
    return null;
  }
}

export default async function ProfileWithDetails() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session?.accessToken) {
    return <p>Please sign in to view your profile details.</p>;
  }

  const linkedInProfile = await getLinkedInProfile(session.accessToken);

  let jobTitle = null;
  let companyName = null;

  if (linkedInProfile?.headline) {
    jobTitle = linkedInProfile.headline;
  }

  if (linkedInProfile?.positions?.elements && linkedInProfile.positions.elements.length > 0) {
    // Assuming the first position is the current one
    const currentPosition = linkedInProfile.positions.elements[0];
    companyName = currentPosition?.companyName;
  }

  return (
    <div>
      <h1>Your Profile Details</h1>
      {session?.user?.name && <p>Name: {session.user.name}</p>}
      {session?.user?.email && <p>Email: {session.user.email}</p>}
      {jobTitle && <p>Job Title: {jobTitle}</p>}
      {companyName && <p>Company: {companyName}</p>}
      {/* ... other profile information */}
    </div>
  );
}