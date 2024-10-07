// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8b9wL_wCPU9BUPeQ1BSIs940AnW8EbDw",
  authDomain: "pmnb-4eea6.firebaseapp.com",
  projectId: "pmnb-4eea6",
  storageBucket: "pmnb-4eea6.appspot.com",
  messagingSenderId: "593884069393",
  appId: "1:593884069393:web:66b339ba779cf118757bb0",
  measurementId: "G-1C4L1PEQZ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };