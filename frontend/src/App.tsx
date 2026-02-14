import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { InAppNotificationProvider } from "@/components/notifications/InAppNotifications";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Resumes from "./pages/Resumes";
import ResumeEditor from "./pages/ResumeEditor";
import Templates from "./pages/Templates";
import Companies from "./pages/Companies";
import Emails from "./pages/Emails";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import CoverLetter from "./pages/CoverLetter";
import JobAnalyzer from "./pages/JobAnalyzer";
import AdminUsers from "./pages/AdminUsers";
import Invoices from "./pages/Invoices";
import Subscription from "./pages/Subscription";
import Teams from "./pages/Teams";
import LoyaltyPoints from "./pages/LoyaltyPoints";
import MyLoyaltyPoints from "./pages/MyLoyaltyPoints";
import Referrals from "./pages/Referrals";
import Support from "./pages/Support";
import ResumeAnalytics from "./pages/ResumeAnalytics";
import InterviewPrep from "./pages/InterviewPrep";
import SalaryNegotiation from "./pages/SalaryNegotiation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <InAppNotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/resumes" element={
              <ProtectedRoute>
                <Resumes />
              </ProtectedRoute>
            } />
            <Route path="/resumes/new" element={
              <ProtectedRoute>
                <ResumeEditor />
              </ProtectedRoute>
            } />
            <Route path="/resumes/:id" element={
              <ProtectedRoute>
                <ResumeEditor />
              </ProtectedRoute>
            } />
            <Route path="/templates" element={
              <ProtectedRoute>
                <Templates />
              </ProtectedRoute>
            } />
            <Route path="/companies" element={
              <ProtectedRoute>
                <Companies />
              </ProtectedRoute>
            } />
            <Route path="/emails" element={
              <ProtectedRoute>
                <Emails />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/cover-letter" element={
              <ProtectedRoute>
                <CoverLetter />
              </ProtectedRoute>
            } />
            <Route path="/job-analyzer" element={
              <ProtectedRoute>
                <JobAnalyzer />
              </ProtectedRoute>
            } />
            
            {/* Billing routes */}
            <Route path="/invoices" element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/teams" element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            } />
            <Route path="/my-points" element={
              <ProtectedRoute>
                <MyLoyaltyPoints />
              </ProtectedRoute>
            } />
            <Route path="/referrals" element={
              <ProtectedRoute>
                <Referrals />
              </ProtectedRoute>
            } />
            
            {/* Support route */}
            <Route path="/support" element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            } />
            <Route path="/resume-analytics" element={
              <ProtectedRoute>
                <ResumeAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/interview-prep" element={
              <ProtectedRoute>
                <InterviewPrep />
              </ProtectedRoute>
            } />
            <Route path="/salary-negotiation" element={
              <ProtectedRoute>
                <SalaryNegotiation />
              </ProtectedRoute>
            } />
            
            {/* Admin routes - require super-admin role */}
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="super-admin">
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/loyalty" element={
              <ProtectedRoute requiredRole="super-admin">
                <LoyaltyPoints />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </InAppNotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
