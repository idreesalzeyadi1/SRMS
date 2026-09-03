import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase Configuration for "Family Khata"
const firebaseConfig = {
  apiKey: "AIzaSyDVi67wHWyVA3_39WoWbfbwt6712XRqFAY",
  authDomain: "family-khata-dd981.firebaseapp.com",
  projectId: "family-khata-dd981",
  storageBucket: "family-khata-dd981.firebasestorage.app",
  messagingSenderId: "1026183185558",
  appId: "1:1026183185558:web:f1354ebf39703cf175eeb7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);