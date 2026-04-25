import { useState } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { getAuthErrorMessage } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthError } from "firebase/auth";

export default function ForgotPassword() {
  const { sendPasswordReset } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email address."); return; }
    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
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
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 shadow-lg"
          style={{ background: "oklch(0.99 0.005 280 / 0.85)", backdropFilter: "blur(16px)", border: "1px solid oklch(0.92 0.02 280 / 0.6)" }}>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "oklch(0.93 0.06 145 / 0.3)" }}>
                <CheckCircle2 className="w-7 h-7" style={{ color: "oklch(0.52 0.16 145)" }} />
              </div>
              <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: "oklch(0.28 0.04 280)" }}>
                Email Sent!
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
              </p>
              <a href="/login">
                <Button className="w-full h-12 rounded-2xl font-semibold"
                  style={{ background: "oklch(0.52 0.16 145)", color: "white" }}>
                  Back to Sign In
                </Button>
              </a>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-xl font-semibold mb-1" style={{ color: "oklch(0.28 0.04 280)" }}>
                Nakalimutan ang Password?
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl font-semibold"
                  style={{ background: "oklch(0.52 0.16 145)", color: "white" }}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          <a href="/login" className="flex items-center justify-center gap-1 hover:underline" style={{ color: "oklch(0.52 0.16 145)" }}>
            <ArrowLeft className="w-3 h-3" /> Back to Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
