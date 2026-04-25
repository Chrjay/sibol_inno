import { useState } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth, getAuthErrorMessage } from "@/contexts/FirebaseAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AuthError } from "firebase/auth";

const passwordRequirements = [
  { label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { label: "Contains a letter", test: (p: string) => /[a-zA-Z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /[0-9]/.test(p) },
];

export default function SignUp() {
  const { signUpWithEmail, signInWithGoogle } = useFirebaseAuth();
  const [, navigate] = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      const msg = getAuthErrorMessage(err as AuthError);
      if (msg) toast.error(msg);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter your name."); return; }
    if (!email) { toast.error("Please enter your email."); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }

    setSubmitting(true);
    try {
      await signUpWithEmail(name.trim(), email, password);
      toast.success("Account created! Welcome to Sibol.");
      navigate("/onboarding");
    } catch (err) {
      toast.error(getAuthErrorMessage(err as AuthError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: "linear-gradient(160deg, oklch(0.97 0.02 280), oklch(0.96 0.03 145 / 0.4), oklch(0.97 0.02 340 / 0.3))" }}>

      {/* Decorative corner brackets */}
      <div className="fixed top-6 left-6 w-8 h-8 border-t-2 border-l-2 opacity-20" style={{ borderColor: "oklch(0.52 0.16 145)" }} />
      <div className="fixed top-6 right-6 w-8 h-8 border-t-2 border-r-2 opacity-20" style={{ borderColor: "oklch(0.52 0.16 145)" }} />
      <div className="fixed bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 opacity-20" style={{ borderColor: "oklch(0.52 0.16 145)" }} />
      <div className="fixed bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 opacity-20" style={{ borderColor: "oklch(0.52 0.16 145)" }} />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
            style={{ background: "linear-gradient(135deg, oklch(0.88 0.08 145), oklch(0.93 0.05 165))" }}>
            <Sprout className="w-8 h-8" style={{ color: "oklch(0.52 0.16 145)" }} />
          </div>
          <h1 className="font-serif text-3xl font-bold" style={{ color: "oklch(0.28 0.04 280)" }}>Sibol</h1>
          <p className="text-sm text-muted-foreground mt-1">Start your growth journey today</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 shadow-lg"
          style={{ background: "oklch(0.99 0.005 280 / 0.85)", backdropFilter: "blur(16px)", border: "1px solid oklch(0.92 0.02 280 / 0.6)" }}>

          <h2 className="font-serif text-xl font-semibold mb-1" style={{ color: "oklch(0.28 0.04 280)" }}>
            Gumawa ng Account
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Create your free Sibol account</p>

          {/* Google Sign-Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-2xl font-medium mb-4 flex items-center gap-3"
            style={{ borderColor: "oklch(0.88 0.02 280)", background: "white" }}
            onClick={handleGoogleSignIn}
            disabled={submitting}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: "oklch(0.9 0.02 280 / 0.6)" }} />
            <span className="text-xs text-muted-foreground">or create with email</span>
            <div className="flex-1 h-px" style={{ background: "oklch(0.9 0.02 280 / 0.6)" }} />
          </div>

          {/* Sign-Up Form */}
          <form onSubmit={handleSignUp} className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12 rounded-2xl"
                style={{ borderColor: "oklch(0.88 0.02 280)" }}
                autoComplete="name"
                disabled={submitting}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-2xl"
                style={{ borderColor: "oklch(0.88 0.02 280)" }}
                autoComplete="email"
                disabled={submitting}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-2xl"
                style={{ borderColor: "oklch(0.88 0.02 280)" }}
                autoComplete="new-password"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicators */}
            {password.length > 0 && (
              <div className="space-y-1 px-1">
                {passwordRequirements.map(({ label, test }) => (
                  <div key={label} className="flex items-center gap-2">
                    <CheckCircle2
                      className="w-3 h-3 flex-shrink-0"
                      style={{ color: test(password) ? "oklch(0.52 0.16 145)" : "oklch(0.7 0.02 280)" }}
                    />
                    <span className="text-xs" style={{ color: test(password) ? "oklch(0.52 0.16 145)" : "oklch(0.6 0.02 280)" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl font-semibold mt-2"
              style={{ background: "oklch(0.52 0.16 145)", color: "white" }}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Gumawa ng Account / Create Account
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
            By signing up, you agree to use this app responsibly for livelihood improvement.
          </p>
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          Mayroon nang account?{" "}
          <a href="/login" className="font-semibold hover:underline" style={{ color: "oklch(0.52 0.16 145)" }}>
            Mag-sign in / Sign in
          </a>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-3">
          <a href="/" className="hover:underline">← Back to home</a>
        </p>
      </div>
    </div>
  );
}
