'use client';

import { getAuth } from 'firebase/auth';
import { app } from './firebaseConfig';

const auth = getAuth(app);

// Simulated Razorpay check (replace with actual API call)
export const checkSubscriptionStatus = async (userId) => {
  const response = await fetch(`/api/razorpay-check?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data.isPremium || false; // Simulated response
};

export const userTier = { isPremium: false }; // Export mutable object to track tier