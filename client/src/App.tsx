import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AgentsPage from "@/pages/agents-page";
import MarketplacePage from "@/pages/marketplace-page";
import WorkflowsPage from "@/pages/workflows-page";
import TeamsPage from "@/pages/teams-page";
import AgentWorkforcePage from "@/pages/agent-workforce-page";
import AgentWorkforceDetail from "@/pages/agent-workforce-detail";
import ProfilePage from "@/pages/profile-page";
import BillingPage from "@/pages/billing-page";
import SettingsPage from "@/pages/settings-page";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminAgents from "@/pages/admin/admin-agents";
import AdminWorkflowRequests from "@/pages/admin/admin-workflow-requests";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/admin-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* User Routes */}
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/agents" component={AgentsPage} />
      <ProtectedRoute path="/marketplace" component={MarketplacePage} />
      <ProtectedRoute path="/workflows" component={WorkflowsPage} />
      <ProtectedRoute path="/teams" component={TeamsPage} />
      <ProtectedRoute path="/agent-workforce" component={AgentWorkforcePage} />
      <ProtectedRoute path="/teams/:id" component={AgentWorkforceDetail} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/billing" component={BillingPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      
      {/* Admin Routes */}
      <AdminRoute path="/admin" component={AdminDashboard} />
      <AdminRoute path="/admin/agents" component={AdminAgents} />
      <AdminRoute path="/admin/workflow-requests" component={AdminWorkflowRequests} />
      
      {/* 404 Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
