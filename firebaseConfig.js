import { LogBox } from 'react-native';
LogBox.ignoreLogs(['@firebase/auth: Auth', 'You are initializing Firebase Auth']);
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// 1. ADD THIS LINE:
import { getFirestore } from 'firebase/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyCtl9twNLP7LhuTVol8jMIXYFYODcOcGhI",
  authDomain: "optiride-gd8055.firebaseapp.com",
  projectId: "optiride-gd8055",
  storageBucket: "optiride-gd8055.firebasestorage.app",
  messagingSenderId: "751912012026",
  appId: "1:751912012026:web:a2ceb14a65eb50bcb1a143"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 2. ADD THIS LINE:
export const db = getFirestore(app);