import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork, disableNetwork } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCCgdfy-sE8vC2T1KQlXypLJ2hPXzy-h6I",
  authDomain: "proyectom2-ff9fc.firebaseapp.com",
  projectId: "proyectom2-ff9fc",
  storageBucket: "proyectom2-ff9fc.appspot.com",
  messagingSenderId: "473347652287",
  appId: "1:473347652287:web:76ce0f5013f882bfc1640a",
  measurementId: "G-WM5ZF0R09B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Habilitar/deshabilitar la red de Firestore
export const enableFirestoreNetwork = () => enableNetwork(db);
export const disableFirestoreNetwork = () => disableNetwork(db);

// Manejo de errores con los mensajes de error de Firestore
export const isFirestoreError = (error: any) => {
  return error?.code && (
    error.code === 'unavailable' ||
    error.code === 'deadline-exceeded' ||
    error.code === 'resource-exhausted' ||
    error.code === 'internal' ||
    error.code === 'unauthenticated'
  );
};
