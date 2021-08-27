import firebase from "firebase/app";
import "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBhfKz8s7v-rnkhxrKUpvKQ1cuxlfghHmw",
  authDomain: "audiorecorder-4d0c9.firebaseapp.com",
  projectId: "audiorecorder-4d0c9",
  storageBucket: "audiorecorder-4d0c9.appspot.com",
  messagingSenderId: "792643899707",
  appId: "1:792643899707:web:370a1bdf5bf523f70ca71e",
};

const app = !firebase.apps.length && firebase.initializeApp(firebaseConfig);
export const auth = app.auth();
export default app;
