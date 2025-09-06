"use client";
import { useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSignup() {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-lg bg-black/40 border border-purple-500/40 p-8 rounded-2xl shadow-2xl w-[90%] max-w-md"
      >
        <h1 className="text-4xl font-extrabold text-center text-purple-300 mb-6 drop-shadow-lg">
          Create Account ✨
        </h1>

        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
        )}

        {/* Email */}
        <div className="relative mb-4">
          <Mail className="absolute top-3 left-3 text-purple-400" size={18} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 w-full p-3 rounded-lg bg-black/60 border border-purple-500/40 text-purple-100 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Password */}
        <div className="relative mb-4">
          <Lock className="absolute top-3 left-3 text-purple-400" size={18} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 w-full p-3 rounded-lg bg-black/60 border border-purple-500/40 text-purple-100 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Confirm Password */}
        <div className="relative mb-6">
          <Lock className="absolute top-3 left-3 text-purple-400" size={18} />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 w-full p-3 rounded-lg bg-black/60 border border-purple-500/40 text-purple-100 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold p-3 rounded-lg shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-200"
        >
          Sign Up
        </button>

        {/* Login Link */}
        <p
          className="mt-4 text-center text-sm text-purple-300 hover:text-purple-400 cursor-pointer"
          onClick={() => router.push("/")}
        >
          Already have an account? <span className="font-semibold">Login</span>
        </p>
      </motion.div>
    </div>
  );
}
