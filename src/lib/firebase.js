import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "react-chat-app-273a4.firebaseapp.com",
  projectId: "react-chat-app-273a4",
  storageBucket: "react-chat-app-273a4.appspot.com",
  messagingSenderId: "933214945416",
  appId: "1:933214945416:web:61e2e970bd6147abe21f3d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()