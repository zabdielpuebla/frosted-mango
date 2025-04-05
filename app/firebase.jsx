import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxWPBO2n53DJrfwHndRhejx-IGvSwQC3I",
  authDomain: "budgetmobile-22e2d.firebaseapp.com",
  projectId: "budgetmobile-22e2d",
  storageBucket: "budgetmobile-22e2d.firebasestorage.app",
  messagingSenderId: "77496733627",
  appId: "1:77496733627:web:3bc2d6a14249785950be9e"
};




// Initialize Firebase
const app = initializeApp(firebaseConfig);
