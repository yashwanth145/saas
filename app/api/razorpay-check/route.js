export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // Simulated Razorpay API response (replace with actual logic)
  // You would typically use Razorpay SDK or API to check subscription
  const isPremium = Math.random() > 0.5; // Random for demo; replace with real check

  return new Response(JSON.stringify({ isPremium }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}