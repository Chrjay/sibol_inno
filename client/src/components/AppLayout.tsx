import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard,
  Map,
  MessageCircle,
  BookOpen,
  User,
  Sprout,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/pathway", icon: Sprout, label: "Pathway" },
  { href: "/map", icon: Map, label: "Explore" },
  { href: "/resources", icon: BookOpen, label: "Programs" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [location, navigate] = useLocation();
  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(getLoginUrl());
      return;
    }
    // Redirect to onboarding if authenticated but profile not complete
    if (!loading && isAuthenticated && !profileLoading && profile !== undefined) {
      if (!profile?.onboardingComplete && location !== "/onboarding") {
        navigate("/onboarding");
      }
    }
  }, [loading, isAuthenticated, profile, profileLoading, location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-sans">Loading Sibol...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ background: "oklch(0.99 0.005 280 / 0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid oklch(0.9 0.02 280 / 0.5)" }}>
        <a href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "oklch(0.52 0.16 145)" }}>
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-semibold text-lg" style={{ color: "oklch(0.52 0.16 145)" }}>Sibol</span>
        </a>
        <a href="/profile" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
          <User className="w-4 h-4 text-muted-foreground" />
        </a>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-safe"
        style={{ background: "oklch(0.99 0.005 280 / 0.92)", backdropFilter: "blur(16px)", borderTop: "1px solid oklch(0.9 0.02 280 / 0.5)" }}>
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));
            return (
              <a
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all touch-target",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-xl transition-all",
                  isActive && "bg-primary/10"
                )}>
                  <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                </div>
                <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                  {label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
