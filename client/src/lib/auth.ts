import { auth } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser
} from "firebase/auth";

export const signIn = async (email: string, password: string) => {
  if (!email.endsWith("@nd.edu")) {
    throw new Error("Only Notre Dame email addresses are allowed");
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  if (!email.endsWith("@nd.edu")) {
    throw new Error("Only Notre Dame email addresses are allowed");
  }
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const isNDStudent = (user: FirebaseUser | null): boolean => {
  return user?.email?.endsWith("@nd.edu") ?? false;
};
