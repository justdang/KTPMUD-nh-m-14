// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWXMEwMPSyMBVf4LikdsVCZ0kN4BhYB6E",
  authDomain: "hlearnhub-testing.firebaseapp.com",
  projectId: "hlearnhub-testing",
  storageBucket: "hlearnhub-testing.firebasestorage.app",
  messagingSenderId: "1054297107041",
  appId: "1:1054297107041:web:e2e985461b9ac570441820",
  measurementId: "G-NSPD0VHMZQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
