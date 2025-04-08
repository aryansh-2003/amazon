
const firebaseConfig = {
    apiKey: "AIzaSyBS3dxYFq28ODSBJOkQyQ-JvStbVJ0J484",
    authDomain: "mini-tv-clone.firebaseapp.com",
    projectId: "mini-tv-clone",
    storageBucket: "mini-tv-clone.firebasestorage.app",
    messagingSenderId: "606463078554",
    appId: "1:606463078554:web:5a3116d62136f6d520ef23",
    measurementId: "G-7M4TLSVBC2"
  };
  

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage(); 