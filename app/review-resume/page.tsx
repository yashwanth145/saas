"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userTier } from "@/app/dashboard/page"; // import the userTier status

const ReviewResume = () => {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (userTier.isPremium) {
      setAllowed(true);
    } else {
      setMessage("You need to be Premium to access Resume Review.");
      const timer = setTimeout(() => {
        router.push("/account");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [router]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">{message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">📄 Resume Review</h1>
        <p className="text-gray-700">This page allows Premium users to get feedback on their resumes.</p>
      </div>
    </div>
  );
};

export default ReviewResume;
