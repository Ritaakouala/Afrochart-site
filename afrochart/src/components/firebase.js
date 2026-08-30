import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD9L7hHh3GyDK5LYCMvJqW_AdW_nuXGyM4",
  authDomain: "afrochart-59c2a.firebaseapp.com",
  projectId: "afrochart-59c2a",
  storageBucket: "afrochart-59c2a.firebasestorage.app",
  messagingSenderId: "509287712840",
  appId: "1:509287712840:web:c84e2f86a90d71e752707d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);