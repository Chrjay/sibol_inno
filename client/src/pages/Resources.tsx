import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { BookOpen, ChevronRight, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "Lahat / All" },
  { value: "training", label: "Training" },
  { value: "grants", label: "Grants" },
  { value: "employment", label: "Employment" },
  { value: "microfinance", label: "Microfinance" },
  { value: "social_protection", label: "Social Protection" },
  { value: "enterprise", label: "Enterprise" },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  training: { bg: "oklch(0.88 0.06 220 / 0.3)", text: "oklch(0.38 0.12 220)" },
  grants: { bg: "oklch(0.88 0.08 145 / 0.3)", text: "oklch(0.38 0.14 145)" },
  employment: { bg: "oklch(0.88 0.06 60 / 0.3)", text: "oklch(0.45 0.12 60)" },
  microfinance: { bg: "oklch(0.88 0.05 280 / 0.3)", text: "oklch(0.38 0.08 280)" },
  social_protection: { bg: "oklch(0.88 0.05 340 / 0.3)", text: "oklch(0.42 0.10 340)" },
  enterprise: { bg: "oklch(0.88 0.07 165 / 0.3)", text: "oklch(0.38 0.12 165)" },
};

export default function Resources() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const { data: programs = [], isLoading } = trpc.programs.list.useQuery(
    category ? { category } : undefined
  );

  const filtered = programs.filter((p) =>
    search.trim() === "" ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.organization?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: "oklch(0.52 0.16 145)" }}>
          Mga Programa / Programs
        </p>
        <h1 className="font-serif text-2xl font-bold" style={{ color: "oklch(0.28 0.04 280)" }}>
          Resource Directory
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Government and NGO programs available to you.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Hanapin ang programa... / Search programs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-12 rounded-2xl border-border bg-card/60"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button key={cat.value} onClick={() => setCategory(cat.value)}
            className={cn(
              "flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium border transition-all touch-target",
              category === cat.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card/60 text-muted-foreground hover:border-primary/40"
            )}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-3">
        {filtered.length} programa ang nahanap / programs found
      </p>

      {/* Program list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Walang nahanap. / No programs found.</p>
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {filtered.map((program) => {
            const colors = CATEGORY_COLORS[program.category] || CATEGORY_COLORS.training;
            return (
              <a key={program.id} href={`/resources/${program.id}`}
                className="flex items-start gap-3 p-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] block"
                style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: colors.bg }}>
                  <BookOpen className="w-5 h-5" style={{ color: colors.text }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-sm text-foreground leading-snug line-clamp-2">
                        {program.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{program.organization}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{ background: colors.bg, color: colors.text }}>
                      {program.category.replace("_", " ")}
                    </span>
                  </div>
                  {program.description && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      {program.description}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
