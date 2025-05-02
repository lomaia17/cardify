// components/LoginButton.tsx
import { signIn } from "next-auth/react";

const LoginButton = () => {
  return (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => signIn("google")}
        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 cursor-pointer"
      >
        Login with Google
      </button>
      <button
        onClick={() => signIn("linkedin")}
        className="bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 cursor-pointer"
      >
        Login with LinkedIn
      </button>
    </div>
  );
};

export default LoginButton;
