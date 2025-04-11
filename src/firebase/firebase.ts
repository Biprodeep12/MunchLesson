import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDsszeyBsTUPzGSyUntfMw6uca95nCtRrQ',
  authDomain: 'updoc-44f03.firebaseapp.com',
  projectId: 'updoc-44f03',
  storageBucket: 'updoc-44f03.firebasestorage.app',
  messagingSenderId: '42340084437',
  appId: '1:42340084437:web:507ec8d0cf316d1659905c',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
