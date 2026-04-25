import { AuthError } from "firebase/auth";

/** Convert Firebase AuthError codes to human-readable bilingual messages */
export function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled. Please try again.";
    case "auth/cancelled-popup-request":
      return "";
    case "auth/unauthorized-domain":
      return "This domain is not authorized. Please contact support.";
    default:
      return "An error occurred. Please try again.";
  }
}
