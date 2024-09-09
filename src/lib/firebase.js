import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "test-9f0b7.firebaseapp.com",
  projectId: "test-9f0b7",
  storageBucket: "test-9f0b7.appspot.com",
  messagingSenderId: "51024001214",
  appId: "1:51024001214:web:e494062588380343e806ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()