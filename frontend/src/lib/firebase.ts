// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuthStore } from "./store/auth-store";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCIPiiG_AAAi2PyTwt1zkM8sWve9A151g",
  authDomain: "edupoll-iitrprai.firebaseapp.com",
  projectId: "edupoll-iitrprai",
  storageBucket: "edupoll-iitrprai.appspot.com",
  messagingSenderId: "781540303330",
  appId: "1:781540303330:web:c24d2cfe3adcd21f20d9bb",
  measurementId: "G-VN77S2N47R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Firebase authentication functions
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  
  // Get ID token for backend authentication
  const idToken = await result.user.getIdToken();
  
  // Store the token
  useAuthStore.getState().setToken(idToken);
  
  return result;
};

export const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  // Get ID token for backend authentication
  const idToken = await result.user.getIdToken();
  
  // Store the token
  useAuthStore.getState().setToken(idToken);
  
  return result;
};

// Add a function to create a user with email and password
export const createUserWithEmail = async (email: string, password: string, displayName?: string) => {
  const auth = getAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update user profile if display name is provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, {
      displayName
    });
  }
  
  return userCredential;
};

export const logout = () => {
  signOut(auth);
  useAuthStore.getState().clearUser();
};

export const analytics = getAnalytics(app);