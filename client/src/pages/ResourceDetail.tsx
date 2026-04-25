import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Phone, Globe, Users, CheckCircle2, HelpCircle, Gift, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  training: { bg: "oklch(0.88 0.06 220 / 0.3)", text: "oklch(0.38 0.12 220)" },
  grants: { bg: "oklch(0.88 0.08 145 / 0.3)", text: "oklch(0.38 0.14 145)" },
  employment: { bg: "oklch(0.88 0.06 60 / 0.3)", text: "oklch(0.45 0.12 60)" },
  microfinance: { bg: "oklch(0.88 0.05 280 / 0.3)", text: "oklch(0.38 0.08 280)" },
  social_protection: { bg: "oklch(0.88 0.05 340 / 0.3)", text: "oklch(0.42 0.10 340)" },
  enterprise: { bg: "oklch(0.88 0.07 165 / 0.3)", text: "oklch(0.38 0.12 165)" },
};

export default function ResourceDetail({ id }: { id: number }) {
  const [, navigate] = useLocation();
  const { data: program, isLoading } = trpc.programs.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
        <div className="h-32 bg-muted rounded-2xl animate-pulse" />
        <div className="h-20 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="px-4 py-5 max-w-lg mx-auto text-center">
        <p className="text-muted-foreground">Program not found.</p>
        <Button variant="ghost" onClick={() => navigate("/resources")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Programs
        </Button>
      </div>
    );
  }

  const colors = CATEGORY_COLORS[program.category] || CATEGORY_COLORS.training;

  const sections = [
    { icon: Users, title: "Sino ang Karapat-dapat / Eligibility", content: program.eligibility },
    { icon: Gift, title: "Mga Benepisyo / Benefits", content: program.benefits },
    { icon: HelpCircle, title: "Paano Mag-apply / How to Apply", content: program.howToApply },
    { icon: Phone, title: "Makipag-ugnayan / Contact", content: program.contactInfo },
  ];

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      {/* Back button */}
      <button onClick={() => navigate("/resources")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors touch-target">
        <ArrowLeft className="w-4 h-4" />
        Bumalik / Back
      </button>

      {/* Program header */}
      <div className="p-5 rounded-2xl mb-4 relative overflow-hidden"
        style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 opacity-30" style={{ borderColor: colors.text }} />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 opacity-30" style={{ borderColor: colors.text }} />

        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: colors.bg }}>
            <BookOpen className="w-6 h-6" style={{ color: colors.text }} />
          </div>
          <div className="flex-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize mb-2 inline-block"
              style={{ background: colors.bg, color: colors.text }}>
              {program.category.replace("_", " ")}
            </span>
            <h1 className="font-serif font-bold text-lg text-foreground leading-snug">{program.name}</h1>
            {program.organization && (
              <p className="text-sm text-muted-foreground mt-0.5">{program.organization}</p>
            )}
          </div>
        </div>

        {program.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>
        )}
      </div>

      {/* Info sections */}
      <div className="space-y-3 mb-5">
        {sections.map(({ icon: Icon, title, content }) =>
          content ? (
            <div key={title} className="p-4 rounded-2xl"
              style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: "oklch(0.52 0.16 145)" }} />
                <h3 className="font-serif font-semibold text-sm text-foreground">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
            </div>
          ) : null
        )}
      </div>

      {/* Website link */}
      {program.website && (
        <a href={program.website} target="_blank" rel="noopener noreferrer">
          <Button className="w-full h-14 rounded-2xl font-semibold text-base"
            style={{ background: "oklch(0.52 0.16 145)", color: "white" }}>
            <Globe className="w-5 h-5 mr-2" />
            Bisitahin ang Website / Visit Website
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>
      )}
    </div>
  );
}
