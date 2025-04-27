import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  connectAuthEmulator,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAxWPBO2n53DJrfwHndRhejx-IGvSwQC3I",
  authDomain: "budgetmobile-22e2d.firebaseapp.com",
  projectId: "budgetmobile-22e2d",
  storageBucket: "budgetmobile-22e2d.firebasestorage.app",
  messagingSenderId: "77496733627",
  appId: "1:77496733627:web:3bc2d6a14249785950be9e"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);


const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Connect to emulator only in development for testing with emulator
// when you want to save actual accounts to firebase console database, remove "connectauthemulator" line below
//if (__DEV__) {
 // connectAuthEmulator(auth, "http://127.0.0.1:9099");
//}

// Firestore setup
const db = getFirestore(app); 

export { auth, db };
