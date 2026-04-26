import { getFirebaseContext, firebaseAuthApi } from "./firebase-service.js";

const DEMO_USERS_KEY = "expoandes_demo_users";
const DEMO_SESSION_KEY = "expoandes_demo_session";

let currentUser = null;
const subscribers = new Set();

function readDemoUsers() {
  return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) ?? "[]");
}

function writeDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function setDemoSession(uid) {
  if (uid) {
    localStorage.setItem(DEMO_SESSION_KEY, uid);
  } else {
    localStorage.removeItem(DEMO_SESSION_KEY);
  }
}

function getDemoSessionUser() {
  const uid = localStorage.getItem(DEMO_SESSION_KEY);
  if (!uid) return null;
  return readDemoUsers().find((user) => user.uid === uid) ?? null;
}

function notifySubscribers(user) {
  currentUser = user;
  subscribers.forEach((callback) => callback(user));
}

export function subscribeToAuth(callback) {
  subscribers.add(callback);
  callback(currentUser);
  return () => subscribers.delete(callback);
}

export function initializeAuth() {
  const { auth, firebaseReady } = getFirebaseContext();

  if (firebaseReady) {
    firebaseAuthApi.onAuthStateChanged(auth, (user) => {
      notifySubscribers(user);
    });
    return;
  }

  notifySubscribers(getDemoSessionUser());
}

export async function registerWithEmail(payload) {
  const { auth, firebaseReady } = getFirebaseContext();

  if (firebaseReady) {
    const credentials = await firebaseAuthApi.createUserWithEmailAndPassword(
      auth,
      payload.email,
      payload.password
    );
    return credentials.user;
  }

  const demoUsers = readDemoUsers();
  const existing = demoUsers.find(
    (item) => item.email.toLowerCase() === payload.email.toLowerCase()
  );

  if (existing) {
    throw new Error("El correo ya está registrado en modo demo.");
  }

  const demoUser = {
    uid: crypto.randomUUID(),
    email: payload.email,
    password: payload.password,
    name: payload.name,
    createdAt: new Date().toISOString(),
  };

  demoUsers.push(demoUser);
  writeDemoUsers(demoUsers);
  setDemoSession(demoUser.uid);
  notifySubscribers(demoUser);
  return demoUser;
}

export async function loginWithEmail(email, password) {
  const { auth, firebaseReady } = getFirebaseContext();

  if (firebaseReady) {
    const credentials = await firebaseAuthApi.signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return credentials.user;
  }

  const demoUser = readDemoUsers().find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() && item.password === password
  );

  if (!demoUser) {
    throw new Error("Credenciales inválidas en modo demo.");
  }

  setDemoSession(demoUser.uid);
  notifySubscribers(demoUser);
  return demoUser;
}

export async function logoutCurrentUser() {
  const { auth, firebaseReady } = getFirebaseContext();

  if (firebaseReady) {
    await firebaseAuthApi.signOut(auth);
    return;
  }

  setDemoSession(null);
  notifySubscribers(null);
}

export function getCurrentUser() {
  return currentUser;
}
