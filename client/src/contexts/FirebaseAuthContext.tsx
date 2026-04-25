import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { trpc } from "@/lib/trpc";

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  idToken: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  idToken: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
        // Store token in sessionStorage for tRPC requests
        sessionStorage.setItem("firebase_id_token", token);
      } else {
        setIdToken(null);
        sessionStorage.removeItem("firebase_id_token");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Refresh token every 50 minutes (tokens expire after 60 min)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const token = await user.getIdToken(true);
      setIdToken(token);
      sessionStorage.setItem("firebase_id_token", token);
    }, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("firebase_id_token");
  };

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        idToken,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  return useContext(FirebaseAuthContext);
}
