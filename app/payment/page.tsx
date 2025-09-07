'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { app } from '../../lib/firebaseConfig';

const auth = getAuth(app);

export default function Payment() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push('/');
      }
    });

    // Dynamically load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay script');
    document.body.appendChild(script);

    return () => {
      unsubscribe();
      document.body.removeChild(script); // Cleanup
    };
  }, [router]);

  const handlePayment = () => {
    if (!user || !razorpayLoaded) return;

    const options = {
      key: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay test key
      amount: '100', // Amount in paise (e.g., $192 * 100)
      currency: 'INR',
      name: 'QuickAI',
      description: 'Premium Subscription',
      image: 'https://your-logo-url.com/logo.png',
      order_id: '', // Generate order_id via your backend
      handler: function (response) {
        alert('Payment successful! Redirecting to dashboard...');
        router.push('/dashboard');
      },
      prefill: {
        name: user.displayName || 'User',
        email: user.email,
        contact: '7975460043', // Replace with user's contact if available
      },
      notes: {
        user_id: user.uid,
      },
      theme: {
        color: '#6366f1',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Head>
        <title>QuickAI - Upgrade to Premium</title>
        <meta name="description" content="Upgrade to QuickAI Premium subscription" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4 text-indigo-600">Upgrade to Premium</h1>
        <p className="text-gray-600 mb-6">Unlock all features with a premium subscription for 1rupee/year.</p>
        <button
          onClick={handlePayment}
          disabled={!razorpayLoaded}
          className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {razorpayLoaded ? 'Pay Now' : 'Loading Payment...'}
        </button>
        <p className="mt-4 text-sm text-gray-500">Secure payment via Razorpay</p>
      </div>
    </div>
  );
}