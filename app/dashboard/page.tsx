'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { app } from '../../lib/firebaseConfig';
import {
  Home,
  FileText,
  Type,
  Image,
  Scissors,
  Trash2,
  FileCheck,
  Users,
} from 'lucide-react';

const auth = getAuth(app);

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-white to-pink-50 text-gray-800">
      <Head>
        <title>QuickAI - AI Dashboard</title>
        <meta
          name="description"
          content="AI-powered dashboard for authenticated users"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl p-6 flex flex-col justify-between overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-200 hover:scrollbar-thumb-indigo-600 rounded-r-2xl">
        <nav className="space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            <Home size={18} /> <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            href="/features/write-article"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            <FileText size={18} />{' '}
            <span className="font-medium">Write Article</span>
          </Link>
          <Link
            href="/features/blog-titles"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            <Type size={18} /> <span className="font-medium">Blog Titles</span>
          </Link>
          <Link
            href="/features/generate-images"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            <Image size={18} />{' '}
            <span className="font-medium">Generate Images</span>
          </Link>
          <Link
            href="/features/remove-background"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            <Scissors size={18} />{' '}
            <span className="font-medium">Remove Background</span>
          </Link>
          <Link
            href="/features/remove-object"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            <Trash2 size={18} />{' '}
            <span className="font-medium">Remove Object</span>
          </Link>
          <Link
            href="/features/review-resume"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            <FileCheck size={18} />{' '}
            <span className="font-medium">Review Resume</span>
          </Link>
        </nav>

        <div>
          <Link
            href="/community"
            className="flex items-center justify-center space-x-2 mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-xl shadow-md hover:opacity-90 transition-all"
          >
            <Users size={18} /> <span className="font-semibold">Community</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="mt-6 w-full text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header with User Icon */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-white to-pink-100 shadow-sm">
          <h1 className="text-2xl font-bold text-indigo-600">QuickAI</h1>
          <button
            onClick={() => router.push('/account')}
            className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 shadow"
          >
            {user?.displayName?.charAt(0) || 'U'}
          </button>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-12 text-center">
          <span className="text-5xl">✨</span>
          <h2 className="text-5xl font-extrabold text-indigo-600">
            Create amazing content
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
            Transform your content creation with our suite of premium AI tools.
            Write articles, generate images, and enhance your workflow.
          </p>
          <div className="mt-6 space-x-4">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-indigo-700 transition-all">
              Start creating now
            </button>
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-full border border-indigo-600 hover:bg-gray-100 transition-all shadow-sm">
              Watch demo
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-12 text-indigo-700">
            Our Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: '📝',
                title: 'AI Writing Assistant',
                desc: 'Generate high-quality articles and blog posts with ease using our advanced AI.',
              },
              {
                icon: '🖼️',
                title: 'Image Generation',
                desc: 'Create stunning images from text prompts with our powerful AI tools.',
              },
              {
                icon: '🚀',
                title: 'Workflow Enhancement',
                desc: 'Streamline your workflow with AI-powered productivity tools.',
              },
              {
                icon: '✍️',
                title: 'Blog Titles',
                desc: 'Instantly generate engaging blog titles tailored to your niche.',
              },
              {
                icon: '🎨',
                title: 'Remove Background',
                desc: 'Easily remove backgrounds from images with one click.',
              },
              {
                icon: '🧹',
                title: 'Remove Objects',
                desc: 'Erase unwanted objects from photos seamlessly.',
              },
              {
                icon: '📄',
                title: 'Resume Overview',
                desc: 'Get AI-powered insights to make your resume stand out.',
              },
              {
                icon: '🎯',
                title: 'Resume Q&A Prep',
                desc: 'Prepare for interviews with AI-generated resume-based questions.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow border border-gray-100 text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-indigo-600">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white text-center py-6 mt-6">
          <p>
            &copy; {new Date().getFullYear()} QuickAI. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
