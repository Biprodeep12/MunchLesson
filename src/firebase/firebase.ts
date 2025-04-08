import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBsq_LZ9e52VQ-ATNZOc6h_PGV2AeE8H_Y',
  authDomain: 'future12-fd3e5.firebaseapp.com',
  projectId: 'future12-fd3e5',
  storageBucket: 'future12-fd3e5.firebasestorage.app',
  messagingSenderId: '710187342319',
  appId: '1:710187342319:web:361aae68d19946e33b3e1a',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
