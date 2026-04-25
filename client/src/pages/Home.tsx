import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Button } from "@/components/ui/button";
import { Sprout, ArrowRight, MapPin, MessageCircle, TrendingUp, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const features = [
  {
    icon: TrendingUp,
    title: "Personalized Pathway",
    desc: "AI builds your step-by-step livelihood roadmap based on your skills and goals.",
    color: "oklch(0.52 0.16 145)",
    bg: "oklch(0.93 0.05 145)",
  },
  {
    icon: MapPin,
    title: "Find Nearby Resources",
    desc: "Discover TESDA centers, DOLE offices, and microfinance partners near you.",
    color: "oklch(0.50 0.14 220)",
    bg: "oklch(0.93 0.04 220)",
  },
  {
    icon: MessageCircle,
    title: "AI Chat Guide",
    desc: "Ask anything in Filipino or English — your personal livelihood advisor.",
    color: "oklch(0.52 0.12 340)",
    bg: "oklch(0.93 0.04 340)",
  },
];

const steps = [
  "Tell us about yourself — skills, location, goals",
  "Get your personalized livelihood pathway",
  "Discover programs and resources near you",
  "Track your progress step by step",
];

export default function Home() {
  const { isAuthenticated, loading, signInWithGoogle } = useFirebaseAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        toast.error("Sign-in failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between sticky top-0 z-40"
        style={{ background: "oklch(0.99 0.005 280 / 0.85)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "oklch(0.52 0.16 145)" }}>
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-bold text-xl" style={{ color: "oklch(0.52 0.16 145)" }}>Sibol</span>
        </div>
        <button onClick={handleSignIn} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Sign in
        </button>
      </header>

      {/* Hero */}
      <section className="flex-1 px-5 pt-10 pb-8 flex flex-col items-center text-center">
        {/* Decorative accent */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "linear-gradient(135deg, oklch(0.88 0.08 145), oklch(0.93 0.05 165))" }}>
            <Sprout className="w-10 h-10" style={{ color: "oklch(0.52 0.16 145)" }} />
          </div>
          <div className="absolute inset-0 rounded-full border border-dashed opacity-30 scale-125"
            style={{ borderColor: "oklch(0.52 0.16 145)" }} />
          <div className="absolute inset-0 rounded-full border opacity-15 scale-150"
            style={{ borderColor: "oklch(0.52 0.16 145)" }} />
        </div>

        <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: "oklch(0.52 0.16 145)" }}>
          Your Livelihood Guide
        </p>

        <h1 className="font-serif text-4xl font-bold leading-tight mb-4" style={{ color: "oklch(0.28 0.04 280)" }}>
          Grow Beyond<br />
          <span style={{ color: "oklch(0.52 0.16 145)" }}>Cash Support</span>
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-xs">
          Sibol guides 4Ps beneficiaries and underserved Filipinos from welfare dependency to a stable, dignified livelihood — one step at a time.
        </p>

        <div className="flex items-center gap-3 mb-8 w-full max-w-xs">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, oklch(0.52 0.16 145 / 0.3))" }} />
          <Sprout className="w-3 h-3" style={{ color: "oklch(0.52 0.16 145 / 0.5)" }} />
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, oklch(0.52 0.16 145 / 0.3))" }} />
        </div>

        <Button
          size="lg"
          className="w-full max-w-xs h-14 text-base font-semibold rounded-2xl shadow-lg"
          style={{ background: "oklch(0.52 0.16 145)", color: "white" }}
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <>
              Simulan ang Iyong Landas
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">Start Your Pathway — Sign in with Google, Free</p>
      </section>

      {/* How it works */}
      <section className="px-5 py-8" style={{ background: "oklch(0.99 0.005 280 / 0.6)" }}>
        <p className="text-xs font-medium tracking-widest uppercase mb-2 text-center" style={{ color: "oklch(0.52 0.16 145)" }}>
          Paano Gumagana
        </p>
        <h2 className="font-serif text-2xl font-semibold text-center mb-6" style={{ color: "oklch(0.28 0.04 280)" }}>
          How It Works
        </h2>
        <div className="space-y-3 max-w-sm mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: "oklch(0.97 0.01 280 / 0.8)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                style={{ background: "oklch(0.52 0.16 145)" }}>
                {i + 1}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-8">
        <p className="text-xs font-medium tracking-widest uppercase mb-2 text-center" style={{ color: "oklch(0.52 0.16 145)" }}>
          Mga Tampok
        </p>
        <h2 className="font-serif text-2xl font-semibold text-center mb-6" style={{ color: "oklch(0.28 0.04 280)" }}>
          Key Features
        </h2>
        <div className="space-y-3 max-w-sm mx-auto">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="flex items-start gap-4 p-4 rounded-2xl"
              style={{ background: "oklch(0.98 0.005 280 / 0.8)", border: "1px solid oklch(0.92 0.02 280 / 0.6)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "oklch(0.28 0.04 280)" }}>{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-5 py-10 text-center"
        style={{ background: "linear-gradient(135deg, oklch(0.93 0.05 145 / 0.4), oklch(0.95 0.04 220 / 0.3))" }}>
        <h2 className="font-serif text-2xl font-semibold mb-3" style={{ color: "oklch(0.28 0.04 280)" }}>
          Handa ka na ba?<br />
          <span className="text-lg font-normal text-muted-foreground">Are you ready to grow?</span>
        </h2>
        <Button
          size="lg"
          className="h-12 px-8 text-sm font-semibold rounded-2xl mt-4"
          style={{ background: "oklch(0.52 0.16 145)", color: "white" }}
          onClick={handleSignIn}
          disabled={loading}
        >
          Get Started Free
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </section>

      <footer className="px-5 py-4 text-center border-t" style={{ borderColor: "oklch(0.9 0.02 280 / 0.4)" }}>
        <p className="text-xs text-muted-foreground">© 2025 Sibol · Grow beyond cash support</p>
      </footer>
    </div>
  );
}
