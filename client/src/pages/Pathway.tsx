import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sprout, CheckCircle2, Circle, Clock, RefreshCw, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Pathway() {
  const utils = trpc.useUtils();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const { data: pathway, isLoading } = trpc.pathway.get.useQuery();
  const generatePathway = trpc.pathway.generate.useMutation({
    onSuccess: () => {
      utils.pathway.get.invalidate();
      toast.success("Bagong pathway na-generate! / New pathway generated!");
    },
    onError: () => toast.error("Could not generate pathway. Please try again."),
  });
  const completeStep = trpc.pathway.completeStep.useMutation({
    onSuccess: () => utils.pathway.get.invalidate(),
    onError: () => toast.error("Could not update step."),
  });
  const uncompleteStep = trpc.pathway.uncompleteStep.useMutation({
    onSuccess: () => utils.pathway.get.invalidate(),
    onError: () => toast.error("Could not update step."),
  });

  const completedSteps = pathway?.steps?.filter((s) => s.isCompleted).length ?? 0;
  const totalSteps = pathway?.steps?.length ?? 0;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  if (isLoading) {
    return (
      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: "oklch(0.52 0.16 145)" }}>
          Iyong Landas / Your Pathway
        </p>
        <h1 className="font-serif text-2xl font-bold" style={{ color: "oklch(0.28 0.04 280)" }}>
          {pathway ? pathway.title : "Livelihood Pathway"}
        </h1>
      </div>

      {pathway ? (
        <>
          {/* Progress overview */}
          <div className="p-4 rounded-2xl"
            style={{ background: "oklch(0.99 0.005 280 / 0.75)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{completedSteps} / {totalSteps} hakbang</p>
                <p className="text-xs text-muted-foreground">{completedSteps} of {totalSteps} steps completed</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-serif font-bold" style={{ color: "oklch(0.52 0.16 145)" }}>{progress}%</p>
              </div>
            </div>
            <Progress value={progress} className="h-2.5" />
            {progress === 100 && (
              <div className="flex items-center gap-2 mt-3 p-2 rounded-xl"
                style={{ background: "oklch(0.88 0.08 145 / 0.3)" }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.52 0.16 145)" }} />
                <p className="text-sm font-medium" style={{ color: "oklch(0.38 0.14 145)" }}>
                  Natapos mo na! Congratulations! 🎉
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {pathway.description && (
            <p className="text-sm text-muted-foreground leading-relaxed px-1">{pathway.description}</p>
          )}

          {/* Steps */}
          <div className="space-y-3">
            {pathway.steps?.map((step, idx) => {
              const isExpanded = expandedStep === step.id;
              const isNext = !step.isCompleted && (idx === 0 || pathway.steps![idx - 1]?.isCompleted);

              return (
                <div key={step.id}
                  className={cn(
                    "rounded-2xl overflow-hidden transition-all",
                    step.isCompleted
                      ? "opacity-75"
                      : isNext
                        ? "ring-2"
                        : ""
                  )}
                  style={{
                    background: "oklch(0.99 0.005 280 / 0.75)",
                    border: "1px solid oklch(0.9 0.02 280 / 0.6)",
                    ...(isNext ? { ringColor: "oklch(0.52 0.16 145)" } : {}),
                  }}>

                  {/* Step header */}
                  <div className="flex items-start gap-3 p-4">
                    {/* Step indicator */}
                    <button
                      onClick={() => {
                        if (step.isCompleted) {
                          uncompleteStep.mutate({ stepId: step.id });
                        } else {
                          completeStep.mutate({ stepId: step.id });
                        }
                      }}
                      className="flex-shrink-0 mt-0.5 touch-target flex items-center justify-center w-8 h-8"
                      disabled={completeStep.isPending || uncompleteStep.isPending}>
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" style={{ color: "oklch(0.52 0.16 145)" }} />
                      ) : isNext ? (
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: "oklch(0.52 0.16 145)" }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: "oklch(0.52 0.16 145)" }} />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs text-muted-foreground">Hakbang {step.stepNumber}</span>
                            {isNext && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: "oklch(0.88 0.08 145 / 0.3)", color: "oklch(0.38 0.14 145)" }}>
                                Susunod / Next
                              </span>
                            )}
                          </div>
                          <h3 className={cn(
                            "font-serif font-semibold text-base leading-snug",
                            step.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                          )}>
                            {step.title}
                          </h3>
                          {step.estimatedDuration && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{step.estimatedDuration}</span>
                            </div>
                          )}
                        </div>
                        <button onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                          className="p-1 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: "oklch(0.9 0.02 280 / 0.5)" }}>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-3">
                        {step.description}
                      </p>
                      {step.resources && (step.resources as string[]).length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-2">Resources / Mga Tulong:</p>
                          <div className="space-y-1">
                            {(step.resources as string[]).map((res, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                  style={{ background: "oklch(0.52 0.16 145)" }} />
                                <p className="text-sm text-foreground">{res}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!step.isCompleted && (
                        <Button onClick={() => completeStep.mutate({ stepId: step.id })}
                          disabled={completeStep.isPending}
                          className="w-full h-10 mt-3 rounded-xl text-sm font-medium"
                          style={{ background: "oklch(0.52 0.16 145)", color: "white" }}>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Markahan bilang Tapos / Mark as Complete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Regenerate */}
          <div className="pt-2 pb-4">
            <Button variant="outline" onClick={() => generatePathway.mutate()} disabled={generatePathway.isPending}
              className="w-full h-12 rounded-2xl border-dashed text-sm"
              style={{ borderColor: "oklch(0.52 0.16 145 / 0.4)", color: "oklch(0.52 0.16 145)" }}>
              {generatePathway.isPending ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Baguhin ang Pathway / Regenerate Pathway
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.52 0.16 145)" }} />
          <h2 className="font-serif text-xl font-semibold mb-2" style={{ color: "oklch(0.28 0.04 280)" }}>
            Wala pang pathway / No pathway yet
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Let AI create your personalized livelihood roadmap.
          </p>
          <Button onClick={() => generatePathway.mutate()} disabled={generatePathway.isPending}
            className="h-14 px-8 rounded-2xl font-semibold"
            style={{ background: "oklch(0.52 0.16 145)", color: "white" }}>
            {generatePathway.isPending ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Ginagawa...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Gumawa ng Pathway</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
