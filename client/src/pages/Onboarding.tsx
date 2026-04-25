import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, ArrowRight, ArrowLeft, CheckCircle2, MapPin, GraduationCap, Users, Target, Briefcase } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EDUCATION_OPTIONS = [
  { value: "no_formal", label: "Walang Pormal na Edukasyon", sub: "No formal education" },
  { value: "elementary", label: "Elementarya", sub: "Elementary" },
  { value: "high_school", label: "Hayskul", sub: "High School" },
  { value: "vocational", label: "Bokasyonal / TESDA", sub: "Vocational / TESDA" },
  { value: "college", label: "Kolehiyo", sub: "College" },
  { value: "college_grad", label: "Nagtapos ng Kolehiyo", sub: "College Graduate" },
];

const SKILLS_OPTIONS = [
  "Pagluluto / Cooking", "Pananahi / Sewing", "Pagmamaneho / Driving",
  "Konstruksyon / Construction", "Pag-aalaga ng Bata / Childcare",
  "Pagtuturo / Teaching", "Agrikultura / Farming", "Pag-aayos ng Sasakyan / Auto Repair",
  "Elektroniks / Electronics", "Negosyo / Business", "Computer / IT",
  "Pag-aalaga ng Hayop / Animal Care", "Paghahabi / Weaving", "Pagpipinta / Painting",
];

const INCOME_OPTIONS = [
  { value: "none", label: "Wala / None" },
  { value: "below_5k", label: "Wala pang ₱5,000 / Below ₱5,000" },
  { value: "5k_10k", label: "₱5,000 – ₱10,000" },
  { value: "10k_20k", label: "₱10,000 – ₱20,000" },
  { value: "above_20k", label: "Higit sa ₱20,000 / Above ₱20,000" },
];

const GOAL_OPTIONS = [
  { value: "start_business", label: "Magsimula ng Negosyo", sub: "Start a small business" },
  { value: "get_job", label: "Makahanap ng Trabaho", sub: "Find employment" },
  { value: "improve_skills", label: "Palakasin ang Kasanayan", sub: "Improve skills / get certified" },
  { value: "increase_income", label: "Dagdagan ang Kita", sub: "Increase income" },
  { value: "financial_stability", label: "Maging Stable Pinansyal", sub: "Achieve financial stability" },
];

const steps = [
  { id: 1, icon: GraduationCap, title: "Edukasyon", sub: "Education Level" },
  { id: 2, icon: Briefcase, title: "Kasanayan", sub: "Skills" },
  { id: 3, icon: MapPin, title: "Lokasyon", sub: "Location" },
  { id: 4, icon: Users, title: "Pamilya", sub: "Family & Income" },
  { id: 5, icon: Target, title: "Layunin", sub: "Goals" },
];

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    educationLevel: "",
    skills: [] as string[],
    location: "",
    dependents: 0,
    monthlyIncome: "",
    goals: "",
  });

  const saveProfile = trpc.profile.save.useMutation({
    onSuccess: () => {
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error("May problema. Subukan ulit. / Something went wrong. Please try again.");
    },
  });

  const toggleSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  };

  const handleNext = () => {
    if (step < 5) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    saveProfile.mutate({
      ...form,
      onboardingComplete: true,
    });
  };

  const canProceed = () => {
    if (step === 1) return !!form.educationLevel;
    if (step === 2) return form.skills.length > 0;
    if (step === 3) return form.location.trim().length > 2;
    if (step === 4) return !!form.monthlyIncome;
    if (step === 5) return !!form.goals;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col px-5 py-6 max-w-lg mx-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "oklch(0.52 0.16 145)" }}>
          <Sprout className="w-4 h-4 text-white" />
        </div>
        <span className="font-serif font-bold text-xl" style={{ color: "oklch(0.52 0.16 145)" }}>Sibol</span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s) => (
          <div key={s.id} className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            s.id === step ? "flex-1" : "w-6",
            s.id < step ? "bg-primary" : s.id === step ? "bg-primary" : "bg-border"
          )} />
        ))}
      </div>

      {/* Step header */}
      <div className="mb-6">
        {(() => {
          const current = steps[step - 1];
          const Icon = current.icon;
          return (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "oklch(0.88 0.08 145 / 0.4)" }}>
                  <Icon className="w-5 h-5" style={{ color: "oklch(0.52 0.16 145)" }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{`Hakbang ${step} ng 5`} · Step {step} of 5</p>
                  <h2 className="font-serif text-xl font-semibold" style={{ color: "oklch(0.28 0.04 280)" }}>
                    {current.title} <span className="text-muted-foreground text-base font-normal">/ {current.sub}</span>
                  </h2>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Step content */}
      <div className="flex-1">
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">Ano ang pinakamataas mong naabot na antas ng edukasyon? / What is your highest education level?</p>
            {EDUCATION_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setForm((f) => ({ ...f, educationLevel: opt.value }))}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all touch-target",
                  form.educationLevel === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card/60 hover:border-primary/40"
                )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.sub}</p>
                  </div>
                  {form.educationLevel === opt.value && (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.52 0.16 145)" }} />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Piliin ang iyong mga kasanayan. / Select your skills (choose all that apply).</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS_OPTIONS.map((skill) => (
                <button key={skill} onClick={() => toggleSkill(skill)}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm border transition-all touch-target",
                    form.skills.includes(skill)
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-card/60 text-foreground hover:border-primary/40"
                  )}>
                  {skill}
                </button>
              ))}
            </div>
            {form.skills.length > 0 && (
              <p className="text-xs text-primary mt-3">{form.skills.length} napili / selected</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Saan ka nakatira? / Where do you live? (City, Municipality, or Province)</p>
            <Input
              placeholder="e.g., Quezon City, Metro Manila"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="h-14 text-base rounded-2xl border-border bg-card/60"
            />
            <p className="text-xs text-muted-foreground">
              Ginagamit ito para mahanap ang mga programa at resources malapit sa iyo. / Used to find programs and resources near you.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Ilang miyembro ng pamilya ang iyong inaasikaso? / How many dependents do you have?</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setForm((f) => ({ ...f, dependents: Math.max(0, f.dependents - 1) }))}
                  className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center text-xl font-bold text-foreground hover:border-primary transition-colors touch-target">
                  −
                </button>
                <span className="text-3xl font-serif font-bold w-12 text-center" style={{ color: "oklch(0.52 0.16 145)" }}>
                  {form.dependents}
                </span>
                <button onClick={() => setForm((f) => ({ ...f, dependents: f.dependents + 1 }))}
                  className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center text-xl font-bold text-foreground hover:border-primary transition-colors touch-target">
                  +
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Magkano ang iyong buwanang kita ngayon? / What is your current monthly income?</p>
              {INCOME_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setForm((f) => ({ ...f, monthlyIncome: opt.value }))}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border mb-2 transition-all touch-target",
                    form.monthlyIncome === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card/60 hover:border-primary/40"
                  )}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground">{opt.label}</p>
                    {form.monthlyIncome === opt.value && (
                      <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.52 0.16 145)" }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">Ano ang iyong pangunahing layunin? / What is your main livelihood goal?</p>
            {GOAL_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setForm((f) => ({ ...f, goals: opt.value }))}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all touch-target",
                  form.goals === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card/60 hover:border-primary/40"
                )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.sub}</p>
                  </div>
                  {form.goals === opt.value && (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.52 0.16 145)" }} />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8 pb-6">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}
            className="flex-1 h-14 rounded-2xl border-border">
            <ArrowLeft className="w-4 h-4 mr-2" /> Bumalik / Back
          </Button>
        )}
        <Button onClick={handleNext} disabled={!canProceed() || saveProfile.isPending}
          className="flex-1 h-14 rounded-2xl font-semibold"
          style={{ background: "oklch(0.52 0.16 145)", color: "white" }}>
          {saveProfile.isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : step === 5 ? (
            <>Tapusin / Finish <CheckCircle2 className="w-5 h-5 ml-2" /></>
          ) : (
            <>Susunod / Next <ArrowRight className="w-5 h-5 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
