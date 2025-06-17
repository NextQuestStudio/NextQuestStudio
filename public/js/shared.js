// =========================================================================
// FIREBASE INITIALIZATION FOR THE PUBLIC WEBSITE
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAkEccEJpBsmdpkH5AonaePBPCxd6EF4_Y",
  authDomain: "next-quest-studios.firebaseapp.com",
  projectId: "next-quest-studios",
  storageBucket: "next-quest-studios.appspot.com",
  messagingSenderId: "428011767655",
  appId: "1:428011767655:web:8a43987aea19616d7211c2",
  measurementId: "G-Z4MTHCZLDD"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Create global aliases for the services we will use across the public site
const auth = firebase.auth();
const db = firebase.firestore();
