import { trpc } from "@/lib/trpc";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { User, Edit3, Save, LogOut, GraduationCap, MapPin, Users, Target, Briefcase, CheckCircle2, Sprout } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EDUCATION_LABELS: Record<string, string> = {
  no_formal: "Walang Pormal / No Formal Education",
  elementary: "Elementarya / Elementary",
  high_school: "Hayskul / High School",
  vocational: "Bokasyonal / Vocational",
  college: "Kolehiyo / College",
  college_grad: "Nagtapos ng Kolehiyo / College Graduate",
};

const INCOME_LABELS: Record<string, string> = {
  none: "Wala / None",
  below_5k: "Wala pang ₱5,000",
  "5k_10k": "₱5,000 – ₱10,000",
  "10k_20k": "₱10,000 – ₱20,000",
  above_20k: "Higit sa ₱20,000",
};

const GOAL_LABELS: Record<string, string> = {
  start_business: "Magsimula ng Negosyo / Start a Business",
  get_job: "Makahanap ng Trabaho / Find Employment",
  improve_skills: "Palakasin ang Kasanayan / Improve Skills",
  increase_income: "Dagdagan ang Kita / Increase Income",
  financial_stability: "Maging Stable Pinansyal / Financial Stability",
};

export default function Profile() {
  const { user, logout } = useFirebaseAuth();
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);

  const { data: profile } = trpc.profile.get.useQuery();
  const saveProfile = trpc.profile.save.useMutation({
    onSuccess: () => {
      utils.profile.get.invalidate();
      setEditing(false);
      toast.success("Profile na-update! / Profile updated!");
    },
    onError: () => toast.error("Could not save profile."),
  });

  const [editForm, setEditForm] = useState({
    location: profile?.location || "",
    goals: profile?.goals || "",
  });

  const handleSave = () => {
    saveProfile.mutate(editForm);
  };

  const skills = profile?.skills as string[] | null;

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: "oklch(0.52 0.16 145)" }}>
            Aking Profile / My Profile
          </p>
          <h1 className="font-serif text-2xl font-bold" style={{ color: "oklch(0.28 0.04 280)" }}>
            Account
          </h1>
        </div>
        <button onClick={() => setEditing(!editing)}
          className="p-2 rounded-xl hover:bg-muted transition-colors touch-target">
          <Edit3 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* User card */}
      <div className="p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.52 0.16 145), oklch(0.45 0.12 165))" }}>
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20" style={{ background: "white" }} />
        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "white/20", border: "2px solid white/40" }}>
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="relative">
          <h2 className="font-serif font-bold text-lg text-white">{user?.displayName || "Sibol User"}</h2>
          <p className="text-white/80 text-sm">{user?.email || ""}</p>
          {profile?.onboardingComplete && (
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-white/80" />
              <span className="text-white/80 text-xs">Profile Complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile details */}
      {profile ? (
        <div className="space-y-3">
          {/* Education */}
          <div className="p-4 rounded-2xl"
            style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4" style={{ color: "oklch(0.52 0.16 145)" }} />
              <p className="text-xs font-semibold text-foreground">Edukasyon / Education</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {EDUCATION_LABELS[profile.educationLevel || ""] || profile.educationLevel || "Not set"}
            </p>
          </div>

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="p-4 rounded-2xl"
              style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4" style={{ color: "oklch(0.52 0.16 145)" }} />
                <p className="text-xs font-semibold text-foreground">Kasanayan / Skills</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span key={skill} className="text-xs px-2 py-1 rounded-full"
                    style={{ background: "oklch(0.88 0.08 145 / 0.3)", color: "oklch(0.38 0.14 145)" }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="p-4 rounded-2xl"
            style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" style={{ color: "oklch(0.52 0.16 145)" }} />
              <p className="text-xs font-semibold text-foreground">Lokasyon / Location</p>
            </div>
            {editing ? (
              <Input value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="City, Province" className="h-10 text-sm rounded-xl" />
            ) : (
              <p className="text-sm text-muted-foreground">{profile.location || "Not set"}</p>
            )}
          </div>

          {/* Family */}
          <div className="p-4 rounded-2xl"
            style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" style={{ color: "oklch(0.52 0.16 145)" }} />
              <p className="text-xs font-semibold text-foreground">Pamilya / Family</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {profile.dependents ?? 0} dependents · {INCOME_LABELS[profile.monthlyIncome || ""] || profile.monthlyIncome || "Income not set"}
            </p>
          </div>

          {/* Goals */}
          <div className="p-4 rounded-2xl"
            style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" style={{ color: "oklch(0.52 0.16 145)" }} />
              <p className="text-xs font-semibold text-foreground">Layunin / Goal</p>
            </div>
            {editing ? (
              <Input value={editForm.goals} onChange={(e) => setEditForm((f) => ({ ...f, goals: e.target.value }))}
                placeholder="Your livelihood goal" className="h-10 text-sm rounded-xl" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {GOAL_LABELS[profile.goals || ""] || profile.goals || "Not set"}
              </p>
            )}
          </div>

          {/* Save button */}
          {editing && (
            <Button onClick={handleSave} disabled={saveProfile.isPending}
              className="w-full h-12 rounded-2xl font-semibold"
              style={{ background: "oklch(0.52 0.16 145)", color: "white" }}>
              {saveProfile.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Save className="w-4 h-4 mr-2" /> I-save / Save Changes</>
              )}
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Sprout className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.52 0.16 145)" }} />
          <p className="text-sm text-muted-foreground mb-4">Complete your profile to get personalized recommendations.</p>
          <a href="/onboarding">
            <Button className="h-12 px-8 rounded-2xl" style={{ background: "oklch(0.52 0.16 145)", color: "white" }}>
              Complete Profile
            </Button>
          </a>
        </div>
      )}

      {/* Logout */}
      <div className="pt-2 pb-6">
        <Button variant="outline" onClick={() => logout()}
          className="w-full h-12 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/5">
          <LogOut className="w-4 h-4 mr-2" />
          Mag-logout / Sign Out
        </Button>
      </div>
    </div>
  );
}
