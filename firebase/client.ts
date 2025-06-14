// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqLyGElt-9l0i5VhMiY52lyV9gFmvXYgY",
  authDomain: "ai-interview-project-e1f39.firebaseapp.com",
  projectId: "ai-interview-project-e1f39",
  storageBucket: "ai-interview-project-e1f39.firebasestorage.app",
  messagingSenderId: "940713392702",
  appId: "1:940713392702:web:ab54ddcc6749cbcf60ef6f",
  measurementId: "G-2C3PKJXTEC",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
