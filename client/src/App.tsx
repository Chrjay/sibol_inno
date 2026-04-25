import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Pathway from "./pages/Pathway";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import Chat from "./pages/Chat";
import MapExplore from "./pages/MapExplore";
import Profile from "./pages/Profile";
import AppLayout from "./components/AppLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard">
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </Route>
      <Route path="/pathway">
        <AppLayout>
          <Pathway />
        </AppLayout>
      </Route>
      <Route path="/resources">
        <AppLayout>
          <Resources />
        </AppLayout>
      </Route>
      <Route path="/resources/:id">
        {(params) => (
          <AppLayout>
            <ResourceDetail id={params.id ?? ""} />
          </AppLayout>
        )}
      </Route>
      <Route path="/map">
        <AppLayout>
          <MapExplore />
        </AppLayout>
      </Route>
      <Route path="/chat">
        <AppLayout>
          <Chat />
        </AppLayout>
      </Route>
      <Route path="/profile">
        <AppLayout>
          <Profile />
        </AppLayout>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
