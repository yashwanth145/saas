"use client";
import { useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid credentials");
      setShake(true);

      // Clear input fields
      setEmail("");
      setPassword("");

      // Stop shaking after animation
      setTimeout(() => setShake(false), 500);
    }
  }

  const shakeAnimation = {
    x: shake ? [0, -10, 10, -10, 10, 0] : 0,
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-lg bg-black/40 border border-purple-500/40 p-8 rounded-2xl shadow-2xl w-[90%] max-w-md"
      >
        <h1 className="text-4xl font-extrabold text-center text-purple-300 mb-6 drop-shadow-lg">
          Welcome Back 📚
        </h1>

        <AnimatePresence>
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm mb-3 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Email input */}
        <motion.div className="relative mb-4" animate={shakeAnimation}>
          <Mail className="absolute top-3 left-3 text-purple-400" size={18} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 w-full p-3 rounded-lg bg-black/60 border border-purple-500/40 text-purple-100 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </motion.div>

        {/* Password input */}
        <motion.div className="relative mb-6" animate={shakeAnimation}>
          <Lock className="absolute top-3 left-3 text-purple-400" size={18} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 w-full p-3 rounded-lg bg-black/60 border border-purple-500/40 text-purple-100 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </motion.div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold p-3 rounded-lg shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-200"
        >
          Login
        </button>

        {/* Signup link */}
        <p
          className="mt-4 text-center text-sm text-purple-300 hover:text-purple-400 cursor-pointer"
          onClick={() => router.push("/signup")}
        >
          Don’t have an account? <span className="font-semibold">Sign Up</span>
        </p>
      </motion.div>
    </div>
  );
}
