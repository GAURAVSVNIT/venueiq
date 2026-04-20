import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDHoXKhTUDDUUdR2iuhloiQwqRQuh0DZaA",
  authDomain: "venueiq-493915.firebaseapp.com",
  projectId: "venueiq-493915",
  storageBucket: "venueiq-493915.firebasestorage.app",
  messagingSenderId: "46442843886",
  appId: "1:46442843886:web:e207ee100379c6df0eadff",
  measurementId: "G-9HXMCRH9CF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export let analytics: Analytics | null = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
