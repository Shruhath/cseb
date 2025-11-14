// Firebase initialization - configure with your Firestore and Auth setup
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDocs,
  where
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword 
} from "firebase/auth";

// Firebase config - use environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration is missing. Please set environment variables.");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Helper functions for Firestore operations
export const linkQueries = {
  getLinks: () => query(collection(db, "links"), orderBy("order", "asc")),
  getAdmins: () => collection(db, "admins"),
  checkIfAdmin: async (uid: string) => {
    const docRef = doc(db, "admins", uid);
    const docSnap = await getDocs(query(collection(db, "admins"), where("__name__", "==", uid)));
    return docSnap.docs.length > 0;
  },
  checkAdminsEmpty: async () => {
    const adminsSnap = await getDocs(collection(db, "admins"));
    return adminsSnap.empty;
  }
};

// Auth functions
export const authFunctions = {
  signUp: (email: string, password: string) => 
    createUserWithEmailAndPassword(auth, email, password),
  signIn: (email: string, password: string) => 
    signInWithEmailAndPassword(auth, email, password),
  signOut: () => signOut(auth),
  onAuthStateChanged: (callback: (user: any) => void) => 
    onAuthStateChanged(auth, callback)
};

// Firestore operations
export const firestoreFunctions = {
  addLink: (data: any) => addDoc(collection(db, "links"), data),
  updateLink: (id: string, data: any) => updateDoc(doc(db, "links", id), data),
  deleteLink: (id: string) => deleteDoc(doc(db, "links", id)),
  subscribeToLinks: (callback: (links: any[]) => void) => {
    return onSnapshot(linkQueries.getLinks(), (snapshot) => {
      const links = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(links);
    });
  },
  subscribeToAdminStatus: (uid: string, callback: (isAdmin: boolean) => void) => {
    return onSnapshot(doc(db, "admins", uid), (snapshot) => {
      callback(snapshot.exists());
    }, () => {
      callback(false);
    });
  }
};
