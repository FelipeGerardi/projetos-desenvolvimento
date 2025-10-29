// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuq6SThL6PyYgOXNqINQQ4xaHXgwl5G2k",
  authDomain: "projetos-ti-chp.firebaseapp.com",
  projectId: "projetos-ti-chp",
  storageBucket: "projetos-ti-chp.firebasestorage.app",
  messagingSenderId: "500923374661",
  appId: "1:500923374661:web:e60e3aa3d33b8c6497572c",
  measurementId: "G-J2G4L2MW0M"
};

// Evita reinicializar no Hot Reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
