"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged,User } from "firebase/auth";
import { useRouter } from "next/navigation";
import {app} from "../../lib/firebaseConfig"; // Adjust the path to your firebase config

const Aiwritingassistant = () => {
  const [prompt, setPrompt] = useState("");
  const [wordCount, setWordCount] = useState(100);
  const [assistantType, setAssistantType] = useState("general");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/"); // Redirect to login if not authenticated
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Function to call Google Gemini API
  const generateText = async () => {
    if (!prompt) return;
    setLoading(true);
    setGeneratedText("");

    try {
      const response = await fetch("/api/aiassistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          wordCount,
          assistantType,
        }),
      });

      const data = await response.json();
      if (data.text) {
        setGeneratedText(data.text);
      } else {
        setGeneratedText("Error generating text. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching the response:", error);
      setGeneratedText("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-white from-pink-700 to-purple-900 text-white flex">
      {/* Left Sidebar for Input */}
      <div className="w-1/3 p-6 bg-gray-800 shadow-lg rounded-r-lg">
        <h2 className="text-2xl font-bold mb-6 text-blue-300">AI Writing Assistant</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prompt</label>
            <textarea
              className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Word Count</label>
            <input
              type="number"
              className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              min="10"
              max="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assistant Type</label>
            <select
              className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={assistantType}
              onChange={(e) => setAssistantType(e.target.value)}
            >
              <option value="general">General</option>
              <option value="creative">Creative Writing</option>
              <option value="technical">Technical Writing</option>
              <option value="academic">Academic</option>
            </select>
          </div>
          <button
            onClick={generateText}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition duration-300"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Text"}
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="w-2/3 p-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-300">Generated Text</h2>
        <div className="bg-white p-6 rounded-lg min-h-[400px] shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
          ) : generatedText ? (
            <p className="text-black leading-relaxed">{generatedText}</p>
          ) : (
            <p className="text-black italic">Enter a prompt and click Generate to see the result here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Aiwritingassistant;