import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Seus dados reais que você acabou de pegar:
const firebaseConfig = {
  apiKey: "AIzaSyAep3n_OPlKsgGP9xHUPZlM9OOVG6tfAGo",
  authDomain: "priscilachefia-5a5e1.firebaseapp.com",
  projectId: "priscilachefia-5a5e1",
  storageBucket: "priscilachefia-5a5e1.firebasestorage.app",
  messagingSenderId: "320403647831",
  appId: "1:320403647831:web:289114a017529d90366212",
  measurementId: "G-WW0TV8K8PG"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Auth com persistência
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };