import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDhEPkfX-jepClu45-ecCmA19KQRqhl208",
  authDomain: "vanilla-typescript-blogapp.firebaseapp.com",
  projectId: "vanilla-typescript-blogapp",
  storageBucket: "vanilla-typescript-blogapp.firebasestorage.app",
  messagingSenderId: "839287050557",
  appId: "1:839287050557:web:5d1ebdc34d339e04c7f554",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const authWithGoogle = async (): Promise<{
  idToken: string;
  user: any;
} | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    if (!idToken) throw new Error("ID token not found");

    return {
      idToken,
      user: result.user,
    };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return null;
  }
};
