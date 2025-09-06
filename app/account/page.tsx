'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { app } from '../../lib/firebaseConfig';

const auth = getAuth(app);

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');

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
        <title>QuickAI - Account Details</title>
        <meta name="description" content="View your account details" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 p-6 overflow-y-auto h-screen">
        <h2 className="text-xl font-semibold mb-6">Account</h2>
        <p className="text-sm text-gray-600 mb-6">Manage your account info.</p>
        <nav className="space-y-4">
          <div
            className={`flex items-center space-x-2 cursor-pointer ${activeSection === 'profile' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <span className="text-gray-400">👤</span>
            <span className="text-gray-800 hover:text-indigo-600">Profile</span>
          </div>
         
          <div
            className={`flex items-center space-x-2 cursor-pointer ${activeSection === 'billing' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveSection('billing')}
          >
            <span className="text-gray-400">💳</span>
            <span className="text-gray-800 hover:text-indigo-600">Billing</span>
          </div>
        </nav>
        <div className="mt-auto text-sm text-gray-500">Secured by Firebase</div>
        <div className="text-sm text-orange-500 mt-2">Development mode</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          {activeSection === 'profile' && (
            <>
              <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center justify-between">
                <span>Profile details</span>
                <button className="text-indigo-600 hover:text-indigo-800">Update profile</button>
              </h1>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Profile</h3>
                  <p className="text-gray-600">Manage your profile information.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Email addresses</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">{user?.email || 'user@example.com'} <span className="text-green-600">Primary</span></span>
                    <button className="text-indigo-600 hover:text-indigo-800">...</button>
                  </div>
                  <button className="mt-2 text-indigo-600 hover:text-indigo-800">+ Add email address</button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Connected accounts</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">Google - {user?.email || 'user@example.com'}</span>
                    <button className="text-indigo-600 hover:text-indigo-800">...</button>
                  </div>
                  <button className="mt-2 text-indigo-600 hover:text-indigo-800">+ Connect account</button>
                </div>
              </div>
            </>
          )}
          {activeSection === 'billing' && (
            <>
              <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center justify-between">
                <span>Billing</span>
                <button className="text-indigo-600 hover:text-indigo-800">Manage payments</button>
              </h1>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Subscription</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">Premium <span className="text-sm text-gray-500">Renews Jul 10, 2025</span></span>
                    <span className="text-gray-800">$192 / year</span>
                    <button className="text-indigo-600 hover:text-indigo-800">Switch plan</button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Payment methods</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">Visa ...4242 <span className="text-green-600">Default</span></span>
                    <button className="text-indigo-600 hover:text-indigo-800">...</button>
                  </div>
                  <button className="mt-2 text-indigo-600 hover:text-indigo-800">+ Add new payment method</button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}