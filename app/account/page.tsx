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
        <div className="text-white text-2xl">Loading...</div>
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
    <span className="ml-2 text-xs text-orange-500 font-semibold">Premium</span>
  );

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
            {!subscriptionStatus && renderPremiumBadge()}
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
              </h1>

              <div className="space-y-6">
                {/* Username */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Username</h3>
                  {editingUsername ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                      <button
                        onClick={handleUsernameUpdate}
                        disabled={updating}
                        className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                      >
                        {updating ? 'Updating...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingUsername(false);
                          setNewUsername(user?.displayName || '');
                        }}
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-800">{user?.displayName || 'No username set'}</p>
                      <button
                        onClick={() => setEditingUsername(true)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* User ID */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">User ID</h3>
                  <p className="text-gray-800">{user?.uid}</p>
                </div>

                {/* Email */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Email</h3>
                  <p className="text-gray-800">
                    {user?.email || 'user@example.com'} <span className="text-green-600">Primary</span>
                  </p>
                </div>

                {/* Connected Accounts */}
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
                {subscriptionStatus ? (
                  <button className="text-indigo-600 hover:text-indigo-800">Manage payments</button>
                ) : (
                  <button
                    onClick={() => router.push('/payment')}
                    className="text-orange-500 hover:text-orange-700"
                  >
                    Upgrade to Premium
                  </button>
                )}
              </h1>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Subscription</h3>
                  {subscriptionStatus ? (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800">
                        Premium <span className="text-sm text-gray-500">Renews Jul 10, 2026</span>
                      </span>
                      <span className="text-gray-800">$1 / year</span>
                      <button className="text-indigo-600 hover:text-indigo-800">Switch plan</button>
                    </div>
                  ) : (
                    <div className="text-gray-600">Free Tier - Upgrade to Premium for advanced features</div>
                  )}
                </div>

                {subscriptionStatus && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Payment methods</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800">Visa ...4242 <span className="text-green-600">Default</span></span>
                      <button className="text-indigo-600 hover:text-indigo-800">...</button>
                    </div>
                    <button className="mt-2 text-indigo-600 hover:text-indigo-800">+ Add new payment method</button>
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

export { userTier };
