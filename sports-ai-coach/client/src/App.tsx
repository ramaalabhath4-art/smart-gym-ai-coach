import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Analysis from "@/pages/Analysis";
import AdvancedAnalysis from "@/pages/AdvancedAnalysis";
import CommunityChat from "@/pages/CommunityChat";
import Payment from "@/pages/Payment";
import PaymentSuccess from "@/pages/PaymentSuccess";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Demo from "./pages/Demo";
import AnalysisResult from "./pages/AnalysisResult";
import Login from "./pages/Login";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/demo"} component={Demo} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/payment"} component={Payment} />
      <Route path={"/payment-success"} component={PaymentSuccess} />
      <Route path={"/analysis"} component={Analysis} />
      <Route path={"/advanced-analysis"} component={AdvancedAnalysis} />
      <Route path={"/community-chat"} component={CommunityChat} />
      <Route path={"/analysis-result"} component={AnalysisResult} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider defaultLanguage="en">
        <ThemeProvider
          defaultTheme="light"
          switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
