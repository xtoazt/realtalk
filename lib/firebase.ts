import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdMVsHU7DsB_iMKxqrCV3nsL9MJmjqiQk",
  authDomain: "treehouse-854e3.firebaseapp.com",
  projectId: "treehouse-854e3",
  storageBucket: "treehouse-854e3.firebasestorage.app",
  messagingSenderId: "472924170216",
  appId: "1:472924170216:web:951cc9e4501b6dabede65d",
  measurementId: "G-X2MY4ZVB6S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
