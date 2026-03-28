import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcpDY2rbM00JHrL-CGaXQQl-bmvInLNbA",
  authDomain: "hash-ee6fc.firebaseapp.com",
  projectId: "hash-ee6fc",
  storageBucket: "hash-ee6fc.appspot.com",
  messagingSenderId: "376797794992",
  appId: "1:376797794992:web:7e95f4fa010e32c1d82175",
  measurementId: "G-39QZ23274G",
};

export function getFirebaseApp() {
  if (getApps().length) {
    return getApp();
  }

  return initializeApp(firebaseConfig);
}

export const db = getFirestore(getFirebaseApp());
