'use client';

export const checkSubscriptionStatus = async (userId) => {
  const response = await fetch(`/api/razorpay-check?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data.isPremium || false; 
};

export const userTier = { isPremium: false };