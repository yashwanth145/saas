'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { app } from '../../lib/firebaseConfig';
import { checkSubscriptionStatus, userTier } from '../../lib/razorpayUtils';

const auth = getAuth(app);

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const isPremium = await checkSubscriptionStatus(currentUser.uid);
        userTier.isPremium = isPremium; // Update exported tier
        setLoading(false);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleFeatureClick = (path, isPremium) => {
    if (isPremium && !userTier.isPremium) {
      router.push('/payment');
    } else {
      router.push(path);
    }
  };

  const handleUpgradeClick = () => {
    router.push('/account');
  };

  const currentDate = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Head>
        <title>QuickAI - AI Dashboard</title>
        <meta name="description" content="AI-powered dashboard for authenticated users" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 p-6 overflow-y-auto h-screen">
        <h2 className="text-xl font-semibold mb-6">Features</h2>
        <nav className="space-y-4">
          <Link href="/ai-writing-assistant" className="flex items-center space-x-2 text-gray-800 hover:text-indigo-600">
            <span className="text-gray-400">📝</span>
            <span>AI Writing Assistant</span>
          </Link>
          <Link href="/text-generation" className="flex items-center space-x-2 text-gray-800 hover:text-indigo-600">
            <span className="text-gray-400">📝</span>
            <span>Text Generation</span>
          </Link>
          <Link
  href="/resume-questions"
  className="flex items-center space-x-2 text-gray-800 hover:text-indigo-600"
>
  <span className="text-green-600">❓</span>
  <span>Resume Questions</span>
</Link>

          <div
            className="flex items-center space-x-2 text-gray-800 hover:text-indigo-600 cursor-pointer"
            onClick={() => handleFeatureClick('/image-generation', true)}
          >
            <span className="text-yellow-600">🖼️</span>
            <span className="text-yellow-600">Image Generation</span>
          </div>
          <div
            className="flex items-center space-x-2 text-gray-800 hover:text-indigo-600 cursor-pointer"
            onClick={() => handleFeatureClick('/remove-background', true)}
          >
            <span className="text-yellow-600">✂️</span>
            <span className="text-yellow-600">Remove Background</span>
          </div>
          <div
            className="flex items-center space-x-2 text-gray-800 hover:text-indigo-600 cursor-pointer"
            onClick={() => handleFeatureClick('/remove-object', true)}
          >
            <span className="text-yellow-600">🚫</span>
            <span className="text-yellow-600">Remove Object</span>
          </div>
          <div
            className="flex items-center space-x-2 text-gray-800 hover:text-indigo-600 cursor-pointer"
            onClick={() => handleFeatureClick('/review-resume', true)}
          >
            <span className="text-yellow-600">📄</span>
            <span className="text-yellow-600">Review Resume</span>
          </div>

        </nav>
        <div className="mt-auto text-sm text-gray-500">Secured by Firebase</div>
        <div className="text-sm text-orange-500 mt-2">Development mode</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-600">Welcome, {user?.displayName || 'User'}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{currentDate}</span>
              <button
                onClick={() => router.push('/account')}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700"
              >
                {user?.displayName?.charAt(0) || 'U'}
              </button>
            </div>
          </div>

          {/* Features Section */}
          <section className="py-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Our Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4 text-indigo-600">📝</div>
                <h3 className="text-xl font-semibold mb-2">AI Writing Assistant</h3>
                <p className="text-gray-600">Generate high-quality articles and blog posts with ease.</p>
                <Link href="/ai-writing-assistant" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
                  Go
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4 text-indigo-600">📝</div>
                <h3 className="text-xl font-semibold mb-2">Text Generation</h3>
                <p className="text-gray-600">Generate high-quality text and a lot of more stuffs.</p>
                <Link href="/text-generation" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
                  Go
                </Link>
              </div>
              <div
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleFeatureClick('/image-generation', true)}
              >
                <div className="text-4xl mb-4 text-yellow-600">🖼️</div>
                <h3 className="text-xl font-semibold mb-2 text-yellow-600">Image Generation</h3>
                <p className="text-gray-600">
                  {userTier.isPremium ? 'Create stunning images.' : 'Available with Premium'}
                </p>
                {userTier.isPremium && (
                  <Link href="/image-generation" className="mt-4 inline-block text-yellow-600 hover:text-yellow-800">
                    Go
                  </Link>
                )}
              </div>
              <div
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleFeatureClick('/remove-background', true)}
              >
                <div className="text-4xl mb-4 text-yellow-600">✂️</div>
                <h3 className="text-xl font-semibold mb-2 text-yellow-600">Remove Background</h3>
                <p className="text-gray-600">
                  {userTier.isPremium ? 'Remove backgrounds easily.' : 'Available with Premium'}
                </p>
                {userTier.isPremium && (
                  <Link href="/remove-background" className="mt-4 inline-block text-yellow-600 hover:text-yellow-800">
                    Go
                  </Link>
                )}
              </div>
              <div
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleFeatureClick('/remove-object', true)}
              >
                <div className="text-4xl mb-4 text-yellow-600">🚫</div>
                <h3 className="text-xl font-semibold mb-2 text-yellow-600">Remove Object</h3>
                <p className="text-gray-600">
                  {userTier.isPremium ? 'Remove objects from images.' : 'Available with Premium'}
                </p>
                {userTier.isPremium && (
                  <Link href="/remove-object" className="mt-4 inline-block text-yellow-600 hover:text-yellow-800">
                    Go
                  </Link>
                )}
              </div>
              <div
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleFeatureClick('/review-resume', true)}
              >
                <div className="text-4xl mb-4 text-yellow-600">📄</div>
                <h3 className="text-xl font-semibold mb-2 text-yellow-600">Review Resume</h3>
                <p className="text-gray-600">
                  {userTier.isPremium ? 'Get resume feedback.' : 'Available with Premium'}
                </p>
                {userTier.isPremium && (
                  <Link href="/review-resume" className="mt-4 inline-block text-yellow-600 hover:text-yellow-800">
                    Go
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* Subscription Plans Section */}
          <section className="py-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Subscription Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Free Plan Card */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-semibold mb-2 text-gray-800">Free Plan</h3>
                <p className="text-gray-600 mb-4">Basic features to get started with QuickAI.</p>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>AI Writing Assistant</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Text Generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-600">✗</span>
                    <span>Image Generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-600">✗</span>
                    <span>Remove Background</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-600">✗</span>
                    <span>Remove Object</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-600">✗</span>
                    <span>Review Resume</span>
                  </li>
                </ul>
              </div>

              {/* Premium Plan Card */}
              <div
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleUpgradeClick}
              >
                <h3 className="text-2xl font-semibold mb-2 text-yellow-600">Premium Plan</h3>
                <p className="text-gray-600 mb-4">Unlock all features with advanced AI tools for $192/year.</p>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>AI Writing Assistant</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Text Generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Image Generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Remove Background</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Remove Object</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Review Resume</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16 px-4 bg-white text-center">
            <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Have questions or need support? Reach out to us, and we’ll get back to you as soon as possible.
            </p>
            <form className="max-w-lg mx-auto space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <textarea
                placeholder="Your Message"
                className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                rows="4"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700"
              >
                Send Message
              </button>
            </form>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white text-center py-6">
          <p>&copy; {new Date().getFullYear()} QuickAI. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

export { userTier }; // Export the user tier status