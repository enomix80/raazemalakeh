import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, getDocFromServer } from "firebase/firestore";

export const config = {
  projectId: "savvy-silo-x71nt",
  appId: "1:648188739327:web:347b850106be8ae7fb56ca",
  apiKey: "AIzaSyDv7sM65vtt8rYc7vVQ8fIi7eGm26gHh2A",
  authDomain: "savvy-silo-x71nt.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-c5676030-eb9c-4f61-9abb-d6629af8d2c2",
  storageBucket: "savvy-silo-x71nt.firebasestorage.app",
  messagingSenderId: "648188739327",
  measurementId: "",
  oAuthClientId: "648188739327-l2vi3gj0s4fif384f4etn5u32suls6bb.apps.googleusercontent.com"
};

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId
export const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

// Connection self-test as required by skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore connection check: client is offline or network restricted.");
    }
  }
}

testConnection();

export { doc, getDoc, setDoc, onSnapshot };
