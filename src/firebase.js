import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDx1QOlVfW8cvxFkdZF1mC3zRK1Ly6Cvxk",
  authDomain: "med-management-b3c01.firebaseapp.com",
  projectId: "med-management-b3c01",
  storageBucket: "med-management-b3c01.firebasestorage.app",
  messagingSenderId: "925527247126",
  appId: "1:925527247126:web:2b08ad868c72a3297ca837"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
