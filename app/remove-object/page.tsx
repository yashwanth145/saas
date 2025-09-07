"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "../../lib/firebaseConfig";

const AIImageEnhancer = () => {
  const [imageFile, setImageFile] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [premium, setPremium] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const res = await fetch(`/api/check-premium?userId=${currentUser.uid}`);
          const data = await res.json();
          if (data.isPremium) {
            setPremium(true);
          } else {
            router.push("/payment");
          }
        } catch (error) {
          console.error("Error checking premium:", error);
          router.push("/payment");
        }
      } else {
        router.push("/payment");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
    } else {
      alert("Please upload a valid image file (JPG, PNG, WebP).");
    }
  };

  const enhanceImage = async () => {
    if (!imageFile) return;
    setLoading(true);
    setEnhancedImage("");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch("/api/enhance-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.imageUrl) {
        setEnhancedImage(data.imageUrl);
      } else {
        setEnhancedImage("Error enhancing image. Please try again.");
      }
    } catch (error) {
      console.error("Error with image enhancement:", error);
      setEnhancedImage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !premium) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black to-purple-900 text-white">
        <p className="text-xl font-semibold text-purple-300">Checking subscription...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 text-white flex font-sans">
      <div className="w-1/3 p-8 bg-gray-950/80 backdrop-blur-lg shadow-xl rounded-r-2xl border-r border-purple-500/20">
        <h2 className="text-3xl font-bold mb-8 text-purple-300 tracking-tight">AI Image Enhancer</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full p-4 bg-gray-900/50 rounded-xl text-white border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              onChange={handleFileChange}
            />
          </div>
          <button
            onClick={enhanceImage}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !imageFile}
          >
            {loading ? "Processing..." : "Enhance Image"}
          </button>
        </div>
      </div>
      <div className="w-2/3 p-10">
        <h2 className="text-3xl font-bold mb-6 text-purple-300 tracking-tight">Enhanced Image</h2>
        <div className="bg-gray-950/80 p-8 rounded-2xl min-h-[500px] shadow-xl border border-purple-500/20 flex items-center justify-center backdrop-blur-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
            </div>
          ) : enhancedImage && enhancedImage.startsWith("data:image") ? (
            <img
              src={enhancedImage}
              alt="Enhanced Image"
              className="max-w-full max-h-[600px] object-contain rounded-xl shadow-lg"
            />
          ) : (
            <p className="text-purple-300/70 italic text-lg">
              {enhancedImage || "Upload an image and click Enhance Image to see the result."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIImageEnhancer;