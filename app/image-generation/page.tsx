"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "../../lib/firebaseConfig";

const Aiimagegenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [premium, setPremium] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // 🔹 Check premium status from backend
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

  const generateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    setGeneratedImage("");

    try {
      const response = await fetch("/api/imagegeneration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        setGeneratedImage("Error generating image. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching from image generation API:", error);
      setGeneratedImage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !premium) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Checking subscription...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex">
      {/* Left Sidebar for Input */}
      <div className="w-1/3 p-6 bg-gray-800 shadow-lg rounded-r-lg">
        <h2 className="text-2xl font-bold mb-6 text-blue-300">AI Image Generator</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prompt</label>
            <textarea
              className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Enter your image prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <button
            onClick={generateImage}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition duration-300"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Image"}
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="w-2/3 p-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-300">Generated Image</h2>
        <div className="bg-gray-800 p-6 rounded-lg min-h-[400px] shadow-lg flex items-center justify-center">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
          ) : generatedImage && generatedImage.startsWith("data:image") ? (
            <img
              src={generatedImage}
              alt="Generated"
              className="max-w-full max-h-[500px] object-contain rounded-lg"
            />
          ) : (
            <p className="text-gray-400 italic">
              {generatedImage || "Enter a prompt and click Generate to see the image here."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Aiimagegenerator;
