import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBT8w6YJQJRIbbwQHMiu8CVNeyypKhMtiM",
  authDomain: "saas-fa336.firebaseapp.com",
  projectId: "saas-fa336",
  storageBucket: "saas-fa336.firebasestorage.app",
  messagingSenderId: "363194605907",
  appId: "1:363194605907:web:678aaeb4d9b21c42c341a6",
  measurementId: "G-9W2G1LLVZV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);

export {auth,app};