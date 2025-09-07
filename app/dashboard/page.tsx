"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import { app } from "../../lib/firebaseConfig";
import { checkSubscriptionStatus } from "../../lib/razorpayUtils";

const auth = getAuth(app);

// Define a user tier interface
interface UserTier {
  isPremium: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<UserTier>({ isPremium: false });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const isPremium = await checkSubscriptionStatus(currentUser.uid);
          setTier({ isPremium });
        } catch (error) {
          console.error("Error checking subscription status:", error);
          setTier({ isPremium: false }); // Fallback to free tier on error
        }
        setLoading(false);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleFeatureClick = (path: string, requiresPremium: boolean) => {
    if (requiresPremium && !tier.isPremium) {
      alert("This feature requires a Premium subscription. Please upgrade!");
      router.push("/payment");
    } else {
      router.push(path);
    }
  };

  const handleUpgradeClick = () => {
    router.push("/payment");
  };

  // Use the system-provided date
  const currentDate = new Date("2025-09-07T20:20:00+05:30").toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }); // 08:20 PM IST, September 07, 2025

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg font-medium animate-pulse">
          Preparing your Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <Head>
        <title>QuickAI - AI Dashboard</title>
        <meta
          name="description"
          content="AI-powered dashboard for authenticated users"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <aside className="w-64 bg-black p-6 overflow-y-auto h-screen border-r border-gray-800">
        <h2 className="text-2xl font-bold mb-8 text-purple-400">QuickAI</h2>
        <style jsx>{`
          @keyframes glitter {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .glitter {
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 215, 0, 0.3),
              rgba(255, 215, 0, 0.6),
              rgba(255, 215, 0, 0.3),
              transparent
            );
            background-size: 200% 100%;
            animation: glitter 7s linear infinite;
          }

          .freepremium {
            background: linear-gradient(
              90deg,
              transparent,
              rgba(79, 6, 96, 0.73),
              rgba(191, 0, 255, 0.6),
              rgba(9, 8, 0, 0.3),
              transparent
            );
            background-size: 200% 100%;
            animation: glitter 7s linear infinite;
          }
        `}</style>
        <nav className="space-y-3">
          <Link
            href="/ai-writing-assistant"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span className="text-purple-400">📝</span>
            <span className="text-white font-medium">AI Writing Assistant</span>
          </Link>
          <Link
            href="/text-generation"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span className="text-purple-400">📝</span>
            <span className="text-white font-medium">Text Generation</span>
          </Link>
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
              !tier.isPremium ? "glitter" : ""
            }`}
            onClick={() => handleFeatureClick("/image-generation", true)}
          >
            <span className="text-white">🖼️</span>
            <span className="text-white font-medium">Image Generation</span>
          </div>
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
              !tier.isPremium ? "glitter" : ""
            }`}
            onClick={() => handleFeatureClick("/remove-background", true)}
          >
            <span className="text-white">✂️</span>
            <span className="text-white font-medium">Remove Background</span>
          </div>
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
              !tier.isPremium ? "glitter" : ""
            }`}
            onClick={() => handleFeatureClick("/remove-object", true)}
          >
            <span className="text-white">🚫</span>
            <span className="text-white font-medium">Remove Object</span>
          </div>
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${"freepremium"}`}
            onClick={() => handleFeatureClick("/review-resume", true)}
          >
            <span className="text-white">📄</span>
            <span className="text-white font-medium">Review Resume</span>
          </div>
        </nav>
        <div className="mt-auto text-sm text-gray-400">Secured by Firebase</div>
        <div className="text-sm text-purple-600 mt-2">Development Mode</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gradient-to-br from-purple-900 to-black overflow-y-auto">
        <div className="max-w-5xl mx-auto bg-black p-8 rounded-xl shadow-2xl border border-gray-800">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-purple-400">
              Welcome, {user?.displayName || "User"}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{currentDate}</span>
              <button
                onClick={() => router.push("/account")}
                className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
              >
                {user?.displayName?.charAt(0) || "U"}
              </button>
              <button
                onClick={handleSignOut}
                className="ml-2 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Features Section */}
          <section className="py-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">
              Our Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-white to-purple-600 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4 text-black">📝</div>
                <h3 className="text-xl font-semibold mb-2 text-black">
                  AI Writing Assistant
                </h3>
                <p className="text-gray-800">
                  Generate high-quality articles and blog posts with ease.
                </p>
                <Link
                  href="/ai-writing-assistant"
                  className="mt-4 inline-block text-black hover:text-gray-900"
                >
                  Go
                </Link>
              </div>
              <div className="bg-gradient-to-br from-white to-purple-600 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4 text-black">📝</div>
                <h3 className="text-xl font-semibold mb-2 text-black">
                  Text Generation
                </h3>
                <p className="text-gray-800">
                  Generate high-quality text and a lot of more stuffs.
                </p>
                <Link
                  href="/text-generation"
                  className="mt-4 inline-block text-black hover:text-gray-900"
                >
                  Go
                </Link>
              </div>
              <div
                className="bg-gradient-to-br from-white to-purple-600 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleFeatureClick("/image-generation", true)}
              >
                <div className="text-4xl mb-4 text-white">🖼️</div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Image Generation
                </h3>
                <p className="text-gray-800">
                  {tier.isPremium ? "Create stunning images." : "Available with Premium"}
                </p>
                {tier.isPremium && (
                  <Link
                    href="/image-generation"
                    className="mt-4 inline-block text-white hover:text-gray-200"
                  >
                    Go
                  </Link>
                )}
              </div>
              <div
                className="bg-gradient-to-br from-white to-purple-600 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleFeatureClick("/remove-background", true)}
              >
                <div className="text-4xl mb-4 text-white">✂️</div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Remove Background
                </h3>
                <p className="text-gray-800">
                  {tier.isPremium ? "Remove backgrounds easily." : "Available with Premium"}
                </p>
                {tier.isPremium && (
                  <Link
                    href="/remove-background"
                    className="mt-4 inline-block text-white hover:text-gray-200"
                  >
                    Go
                  </Link>
                )}
              </div>
              <div
                className="bg-gradient-to-br from-white to-purple-600 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleFeatureClick("/remove-object", true)}
              >
                <div className="text-4xl mb-4 text-white">🚫</div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Remove Object
                </h3>
                <p className="text-gray-800">
                  {tier.isPremium ? "Remove objects from images." : "Available with Premium"}
                </p>
                {tier.isPremium && (
                  <Link
                    href="/remove-object"
                    className="mt-4 inline-block text-white hover:text-gray-200"
                  >
                    Go
                  </Link>
                )}
              </div>
              <div
                className="bg-gradient-to-br from-white to-purple-600 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleFeatureClick("/review-resume", true)}
              >
                <div className="text-4xl mb-4 text-white">📄</div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Review Resume
                </h3>
                <p className="text-gray-800">
                  {tier.isPremium ? "Get resume feedback." : "Available with Premium"}
                </p>
                {tier.isPremium && (
                  <Link
                    href="/review-resume"
                    className="mt-4 inline-block text-white hover:text-gray-200"
                  >
                    Go
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* Subscription Plans Section */}
          <section className="py-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">
              Subscription Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Free Plan Card */}
              <div className="bg-gradient-to-br from-white to-purple-600 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-semibold mb-2 text-black">
                  Free Plan
                </h3>
                <p className="text-gray-800 mb-4">
                  Basic features to get started with QuickAI.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-900">✓</span>
                    <span className="text-black">AI Writing Assistant</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-900">✓</span>
                    <span className="text-black">Text Generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-900">✗</span>
                    <span className="text-black">Image Generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-900">✗</span>
                    <span className="text-black">Remove Background</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-900">✗</span>
                    <span className="text-black">Remove Object</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-900">✗</span>
                    <span className="text-black">Review Resume</span>
                  </li>
                </ul>
              </div>

              {/* Premium Plan Card */}
              <div
                className="bg-gradient-to-br from-white to-purple-600 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleUpgradeClick}
              >
                <h3 className="text-2xl font-semibold mb-2 text-white">
                  Premium Plan
                </h3>
                <p className="text-gray-800 mb-4">
                  Unlock all features with advanced AI tools for $192/year.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-900">✓</span>
                    <span className="text-black">AI Writing Assistant</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-900">✓</span>
                    <span className="text-black">Text Generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-900">✓</span>
                    <span className="text-white">Image Generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-900">✓</span>
                    <span className="text-white">Remove Background</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-900">✓</span>
                    <span className="text-white">Remove Object</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-900">✓</span>
                    <span className="text-white">Review Resume</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16 px-4 bg-gray-950/80 backdrop-blur-lg text-center rounded-3xl border border-purple-500/20">
            <h2 className="text-3xl font-extrabold text-purple-300 mb-6 tracking-tight">
              Contact Us
            </h2>
            <p className="text-purple-200/70 mb-8 max-w-xl mx-auto text-lg">
              Have questions or need support? Reach out to our team, and we’ll
              assist you promptly.
            </p>
            <div className="max-w-lg mx-auto space-y-4 text-purple-200">
              <p className="text-sm">
                <span className="font-semibold text-purple-300">Email:</span>{" "}
                yashwanthreddy05official@gmail.com
              </p>
              <p className="text-sm">
                <span className="font-semibold text-purple-300">Phone:</span> +91 7975460043
              </p>
              <p className="text-sm">
                <span className="font-semibold text-purple-300">Address:</span>{" "}
                Siddaganga Institute of Technology, Tumkur, Karnataka, India
                572103
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-black text-gray-400 text-center py-6 mt-8">
          <p>&copy; {new Date().getFullYear()} QuickAI. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}