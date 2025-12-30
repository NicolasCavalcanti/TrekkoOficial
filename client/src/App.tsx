import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Trails from "./pages/Trails";
import TrailDetail from "./pages/TrailDetail";
import Guides from "./pages/Guides";
import GuideDetail from "./pages/GuideDetail";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import About from "./pages/About";
import ExpeditionDetail from "./pages/ExpeditionDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/trilhas" component={Trails} />
      <Route path="/trilha/:id" component={TrailDetail} />
      <Route path="/expedicao/:id" component={ExpeditionDetail} />
      <Route path="/guias" component={Guides} />
      <Route path="/guia/:id" component={GuideDetail} />
      <Route path="/perfil" component={Profile} />
      <Route path="/admin" component={Admin} />
      <Route path="/sobre" component={About} />
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
