import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sprout, ArrowRight, CheckCircle2, Clock, Sparkles, BookOpen, Map, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const quickLinks = [
  { href: "/pathway", icon: Sprout, label: "My Pathway", color: "oklch(0.52 0.16 145)", bg: "oklch(0.88 0.08 145 / 0.3)" },
  { href: "/map", icon: Map, label: "Explore Map", color: "oklch(0.50 0.14 220)", bg: "oklch(0.88 0.06 220 / 0.3)" },
  { href: "/resources", icon: BookOpen, label: "Programs", color: "oklch(0.52 0.12 340)", bg: "oklch(0.88 0.05 340 / 0.3)" },
  { href: "/chat", icon: MessageCircle, label: "Ask AI", color: "oklch(0.52 0.14 60)", bg: "oklch(0.93 0.06 60 / 0.3)" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: pathway, isLoading: pathwayLoading } = trpc.pathway.get.useQuery();
  const generatePathway = trpc.pathway.generate.useMutation({
    onSuccess: () => {
      toast.success("Pathway generated! / Nagawa na ang iyong landas!");
    },
    onError: () => {
      toast.error("Could not generate pathway. Please try again.");
    },
  });

  const completedSteps = pathway?.steps?.filter((s) => s.isCompleted).length ?? 0;
  const totalSteps = pathway?.steps?.length ?? 0;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const firstName = user?.name?.split(" ")[0] || "Ka-Sibol";
  const greeting = new Date().getHours() < 12 ? "Magandang umaga" : new Date().getHours() < 18 ? "Magandang hapon" : "Magandang gabi";

  // Redirect to onboarding if no profile (handled via useEffect in AppLayout)
  // No render-phase navigation here

  return (
    <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
      {/* Greeting */}
      <div className="relative p-5 rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.52 0.16 145), oklch(0.45 0.12 165))" }}>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20" style={{ background: "white" }} />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10" style={{ background: "white" }} />
        <div className="relative">
          <p className="text-white/80 text-sm mb-1">{greeting}, {firstName}!</p>
          <h1 className="font-serif text-2xl font-bold text-white leading-tight">
            {pathway ? "Patuloy ka!" : "Simulan natin!"}
          </h1>
          <p className="text-white/80 text-sm mt-1">
            {pathway ? "Keep going on your pathway." : "Let's build your pathway."}
          </p>
        </div>
      </div>

      {/* Pathway Progress Card */}
      {pathwayLoading ? (
        <div className="p-5 rounded-2xl animate-pulse" style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
          <div className="h-4 bg-muted rounded w-3/4 mb-3" />
          <div className="h-2 bg-muted rounded w-full mb-2" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      ) : pathway ? (
        <div className="p-5 rounded-2xl relative overflow-hidden"
          style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 opacity-30" style={{ borderColor: "oklch(0.52 0.16 145)" }} />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 opacity-30" style={{ borderColor: "oklch(0.52 0.16 145)" }} />

          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-3">
              <p className="text-xs text-muted-foreground mb-1">Iyong Landas / Your Pathway</p>
              <h2 className="font-serif font-semibold text-base text-foreground leading-snug">{pathway.title}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "oklch(0.88 0.08 145 / 0.3)" }}>
              <Sprout className="w-5 h-5" style={{ color: "oklch(0.52 0.16 145)" }} />
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">{completedSteps} of {totalSteps} steps</span>
              <span className="text-xs font-semibold" style={{ color: "oklch(0.52 0.16 145)" }}>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Next step */}
          {(() => {
            const nextStep = pathway.steps?.find((s) => !s.isCompleted);
            return nextStep ? (
              <div className="flex items-start gap-2 p-3 rounded-xl mt-2"
                style={{ background: "oklch(0.97 0.01 165 / 0.6)" }}>
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.52 0.16 145)" }} />
                <div>
                  <p className="text-xs text-muted-foreground">Susunod / Next Step</p>
                  <p className="text-sm font-medium text-foreground">{nextStep.title}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl mt-2"
                style={{ background: "oklch(0.88 0.08 145 / 0.2)" }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.52 0.16 145)" }} />
                <p className="text-sm font-medium" style={{ color: "oklch(0.52 0.16 145)" }}>Tapos na! Congratulations!</p>
              </div>
            );
          })()}

          <Button variant="ghost" className="w-full mt-3 h-10"
            onClick={() => { window.location.href = "/pathway"; }}
            style={{ color: "oklch(0.52 0.16 145)" }}>
            Tingnan ang Buong Landas / View Full Pathway <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      ) : (
        <div className="p-5 rounded-2xl text-center"
          style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px dashed oklch(0.52 0.16 145 / 0.4)" }}>
          <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: "oklch(0.52 0.16 145)" }} />
          <h2 className="font-serif text-lg font-semibold mb-2" style={{ color: "oklch(0.28 0.04 280)" }}>
            Handa ka na bang lumago?
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Let AI build your personalized livelihood pathway based on your profile.
          </p>
          <Button onClick={() => generatePathway.mutate()} disabled={generatePathway.isPending}
            className="w-full h-12 rounded-2xl font-semibold"
            style={{ background: "oklch(0.52 0.16 145)", color: "white" }}>
            {generatePathway.isPending ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Ginagawa... / Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Gumawa ng Pathway / Generate Pathway</>
            )}
          </Button>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h3 className="font-serif text-base font-semibold mb-3" style={{ color: "oklch(0.28 0.04 280)" }}>
          Mabilis na Akses / Quick Access
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map(({ href, icon: Icon, label, color, bg }) => (
            <a key={href} href={href}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-sm font-medium text-foreground leading-tight">{label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Profile completion prompt */}
      {profile && !profile.onboardingComplete && (
        <div className="p-4 rounded-2xl flex items-center gap-3"
          style={{ background: "oklch(0.93 0.04 60 / 0.4)", border: "1px solid oklch(0.85 0.06 60 / 0.5)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.75 0.12 60)" }}>
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Complete your profile</p>
            <p className="text-xs text-muted-foreground">Get better pathway recommendations.</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => { window.location.href = "/onboarding"; }}
            className="text-xs h-8 px-3 rounded-xl">
            Go
          </Button>
        </div>
      )}
    </div>
  );
}
