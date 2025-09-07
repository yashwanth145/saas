'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { app } from '../../lib/firebaseConfig';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id?: string;
  image?: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
}

type RazorpayEventHandler = (response: RazorpayPaymentResponse | unknown) => void;

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed' | 'payment.success' | string, handler: RazorpayEventHandler): void;
  close(): void;
}

const auth = getAuth(app);

export default function Payment() {
  const [user, setUser] = useState<User | null>(null);
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

    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay script');
    document.body.appendChild(script);

    return () => {
      unsubscribe();
      document.body.removeChild(script);
    };
  }, [router]);

  const handlePayment = async () => {
    if (!user || !razorpayLoaded) return;

    // 🔹 Call your backend to create an order
    const res = await fetch('/api/createorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, amount: 100 }), // 100 paise = ₹1
    });

    const order: { id: string; amount: number; currency: string } = await res.json();

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      amount: order.amount,
      currency: order.currency,
      name: 'QuickAI',
      description: 'Premium Subscription',
      order_id: order.id,
      image: 'https://your-logo-url.com/logo.png',
      handler: function () {
        alert('Payment successful! Redirecting to dashboard...');
        router.push('/dashboard');
      },
      prefill: {
        name: user.displayName || 'User',
        email: user.email || undefined,
        contact: '7975460043',
      },
      notes: { user_id: user.uid },
      theme: { color: '#6366f1' },
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
        <p className="text-gray-600 mb-6">
          Unlock all features with a premium subscription for ₹1/year.
        </p>
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
