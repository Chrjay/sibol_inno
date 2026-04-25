import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  User,
  AuthError,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  idToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  idToken: null,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  sendPasswordReset: async () => {},
  logout: async () => {},
});

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle redirect result when returning from Google sign-in
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        // result is null when there's no pending redirect — that's normal
        if (result?.user) {
          // onAuthStateChanged will pick up the signed-in user automatically
          console.log("[Firebase] Redirect sign-in completed for:", result.user.email);
        }
      })
      .catch((error) => {
        // Only log real errors, not the "no pending redirect" case
        if (error?.code && error.code !== "auth/no-auth-event") {
          console.error("[Firebase] Redirect sign-in error:", error.code, error.message);
        }
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
        sessionStorage.setItem("firebase_id_token", token);
      } else {
        setIdToken(null);
        sessionStorage.removeItem("firebase_id_token");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Refresh token every 50 minutes (Firebase tokens expire after 60 min)
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
    // Use redirect instead of popup — works in iframes, preview mode, and all browsers
    await signInWithRedirect(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    // Set the display name immediately after account creation
    await updateProfile(credential.user, { displayName: name });
    // Force token refresh so displayName is included in the ID token claims
    await credential.user.getIdToken(true);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
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
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
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
