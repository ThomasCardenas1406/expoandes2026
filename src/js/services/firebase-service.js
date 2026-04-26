import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { appSettings, firebaseConfig } from "../firebase-config.js";

let app = null;
let auth = null;
let db = null;
let firebaseReady = false;

export function initializeFirebase() {
  const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

  if (!hasConfig) {
    return { ready: false, usingDemo: appSettings.enableDemoMode };
  }

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseReady = true;
    return { ready: true, usingDemo: false };
  } catch (error) {
    console.error("No fue posible inicializar Firebase", error);
    firebaseReady = false;
    return { ready: false, usingDemo: appSettings.enableDemoMode, error };
  }
}

export function getFirebaseContext() {
  return {
    app,
    auth,
    db,
    firebaseReady,
    usingDemo: !firebaseReady && appSettings.enableDemoMode,
  };
}

export const firebaseAuthApi = {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
};

export const firestoreApi = {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
};
