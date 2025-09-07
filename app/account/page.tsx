'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, updateProfile, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { app } from '../../lib/firebaseConfig';
import { checkSubscriptionStatus, userTier } from '../../lib/razorpayUtils';

const auth = getAuth(app);

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setNewUsername(currentUser.displayName || '');
        const isPremium = await checkSubscriptionStatus(currentUser.uid);
        setSubscriptionStatus(isPremium);
        userTier.isPremium = isPremium;
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
        <div className="text-black text-lg font-medium animate-pulse">Preparing your Account...</div>
      </div>
    );
  }

  const handleUsernameUpdate = async () => {
    if (!user) return;
    if (!newUsername.trim()) return;
    setUpdating(true);
    try {
      await updateProfile(user, { displayName: newUsername });
      setUser({ ...user, displayName: newUsername });
      setEditingUsername(false);
    } catch (err) {
      console.error('Error updating username:', err);
    }
    setUpdating(false);
  };

  const renderPremiumBadge = () => (
    <span className="ml-2 text-xs text-purple-500 font-semibold">Premium</span>
  );

  return (
    <div className="min-h-screen flex bg-gray-900">
      <Head>
        <title>QuickAI - Account Details</title>
        <meta name="description" content="View your account details" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <aside className="w-64 bg-black p-6 overflow-y-auto h-screen border-r border-gray-800">
        <h2 className="text-2xl font-bold mb-8 text-purple-400">QuickAI</h2>
        <p className="text-sm text-gray-400 mb-6">Manage your account info.</p>
        <style jsx>{`
          @keyframes glitter {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
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
            animation: glitter 3s linear infinite;
          }
        `}</style>
        <nav className="space-y-3">
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition-colors cursor-pointer ${
              activeSection === 'profile' ? 'bg-gray-800' : ''
            }`}
            onClick={() => setActiveSection('profile')}
          >
            <span className="text-purple-400">👤</span>
            <span className="text-black font-medium">Profile</span>
          </div>
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
              activeSection === 'billing' ? 'bg-gray-800' : !subscriptionStatus ? 'glitter' : ''
            }`}
            onClick={() => setActiveSection('billing')}
          >
            <span className="text-purple-400">💳</span>
            <span className="text-black font-medium">Billing</span>
            {subscriptionStatus && renderPremiumBadge()}
          </div>
        </nav>
        <div className="mt-auto text-sm text-gray-400">Secured by Firebase</div>
        <div className="text-sm text-purple-600 mt-2">Development Mode</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-black">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-white to-purple-600 p-6 rounded-xl shadow-2xl">
          {activeSection === 'profile' && (
            <>
              <h1 className="text-3xl font-bold mb-6 text-black flex items-center justify-between">
                <span>Profile details</span>
              </h1>

              <div className="space-y-6">
                {/* Username */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-black">Username</h3>
                  {editingUsername ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="p-2 border border-gray-300 rounded w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <button
                        onClick={handleUsernameUpdate}
                        disabled={updating}
                        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                      >
                        {updating ? 'Updating...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingUsername(false);
                          setNewUsername(user?.displayName || '');
                        }}
                        className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-black">{user?.displayName || 'No username set'}</p>
                      <button
                        onClick={() => setEditingUsername(true)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* User ID */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-black">User ID</h3>
                  <p className="text-black">{user?.uid}</p>
                </div>

                {/* Email */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-black">Email</h3>
                  <p className="text-black">
                    {user?.email || 'user@example.com'} <span className="text-green-900">Primary</span>
                  </p>
                </div>

                {/* Connected Accounts */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-black">Connected accounts</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-black">Google - {user?.email || 'user@example.com'}</span>
                    <button className="text-purple-600 hover:text-purple-800">...</button>
                  </div>
                  <button className="mt-2 text-purple-600 hover:text-purple-800">+ Connect account</button>
                </div>
              </div>
            </>
          )}

          {activeSection === 'billing' && (
            <>
              <h1 className="text-3xl font-bold mb-6 text-black flex items-center justify-between">
                <span>Billing</span>
                {subscriptionStatus ? (
                  <button className="text-purple-600 hover:text-purple-800">Manage payments</button>
                ) : (
                  <button
                    onClick={() => router.push('/payment')}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    Upgrade to Premium
                  </button>
                )}
              </h1>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-black">Subscription</h3>
                  {subscriptionStatus ? (
                    <div className="flex items-center justify-between">
                      <span className="text-black">
                        Premium <span className="text-sm text-gray-600">Renews Jul 10, 2026</span>
                      </span>
                      <span className="text-black">$1 / year</span>
                      <button className="text-purple-600 hover:text-purple-800">Switch plan</button>
                    </div>
                  ) : (
                    <div className="text-black">Free Tier - Upgrade to Premium for advanced features</div>
                  )}
                </div>

                {subscriptionStatus && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-black">Payment methods</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-black">Visa ...4242 <span className="text-green-900">Default</span></span>
                      <button className="text-purple-600 hover:text-purple-800">...</button>
                    </div>
                    <button className="mt-2 text-purple-600 hover:text-purple-800">+ Add new payment method</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}