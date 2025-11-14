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

// Firebase config - use environment variables in production
const firebaseConfig = {
  apiKey: "AIzaSyAcS43HJjJHsXnwa6A-O6a6mSTdvBaFWIE",
  authDomain: "semtree-2450d.firebaseapp.com",
  projectId: "semtree-2450d",
  storageBucket: "semtree-2450d.firebasestorage.app",
  messagingSenderId: "201762808116",
  appId: "1:201762808116:web:dbf96f69a50b5dbeffc561",
  measurementId: "G-W9CKVG2DQV"
};

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
