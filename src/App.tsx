import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Index from "./pages/Index";
import ReportViewer from "./pages/ReportViewer";
import NotFound from "./pages/NotFound";
// Import App2 components
import App2Index from "./app2-components/pages/Index";

const queryClient = new QueryClient();

// Navigation Component
const Navigation = () => {
  const location = useLocation();
  
  // Don't show navigation on landing page
  if (location.pathname === '/') return null;
  
  return (
    <nav className="bg-gray-800 text-white p-4 mb-4">
      <div className="flex space-x-4">
        <Link 
          to="/" 
          className="hover:text-blue-300 transition-colors"
        >
          🏠 Home
        </Link>
        <Link 
          to="/app" 
          className="hover:text-blue-300 transition-colors"
        >
          📊 App 1 - Reports
        </Link>
        <Link 
          to="/app2" 
          className="hover:text-blue-300 transition-colors"
        >
          🎯 App 2 - Features
        </Link>
      </div>
    </nav>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          {/* App 1 Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<Index />} />
          <Route path="/report/view/:jobId" element={<ReportViewer />} />
          
          {/* App 2 Routes */}
          <Route path="/app2" element={<App2Index />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;