import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const { userId, amount } = await req.json();

    if (!userId || !amount) {
      return new Response(JSON.stringify({ error: "userId and amount required" }), { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { userId },
    });

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
