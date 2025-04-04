import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserRole } from "@shared/schema";

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: "bxs-dashboard" },
    { path: "/agents", label: "My AI Agents", icon: "bx-bot" },
    { path: "/marketplace", label: "Marketplace", icon: "bx-store" },
    { path: "/workflows", label: "Workflows", icon: "bx-flow" },
    { path: "/agent-workforce", label: "Agent Workforce", icon: "bx-briefcase" },
    { path: "/teams", label: "Teams", icon: "bx-group" },
  ];
  
  const accountItems = [
    { path: "/profile", label: "Profile", icon: "bx-user" },
    { path: "/billing", label: "Billing", icon: "bx-credit-card" },
    { path: "/settings", label: "Settings", icon: "bx-cog" },
  ];
  
  const adminItems = [
    { path: "/admin", label: "Admin Dashboard", icon: "bx-shield" },
    { path: "/admin/agents", label: "Manage Agents", icon: "bx-bot" },
    { path: "/admin/workflow-requests", label: "Workflow Requests", icon: "bx-flow" },
  ];
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };
  
  const isAdmin = user?.role === UserRole.ADMIN;
  
  return (
    <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center">
        <h1 className="text-xl font-bold">Processimo</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs uppercase text-gray-400 font-semibold">Main</div>
        
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={cn(
              "flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded mx-2 mb-1",
              location === item.path && "bg-gray-800"
            )}
          >
            <i className={`bx ${item.icon} mr-3`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
        
        {isAdmin && (
          <>
            <div className="px-4 mt-6 mb-2 text-xs uppercase text-gray-400 font-semibold">
              Admin Panel
            </div>
            
            {adminItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded mx-2 mb-1",
                  location === item.path && "bg-gray-800"
                )}
              >
                <i className={`bx ${item.icon} mr-3`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
          </>
        )}
        
        <div className="px-4 mt-6 mb-2 text-xs uppercase text-gray-400 font-semibold">Account</div>
        
        {accountItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={cn(
              "flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded mx-2 mb-1",
              location === item.path && "bg-gray-800"
            )}
          >
            <i className={`bx ${item.icon} mr-3`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              {user?.firstName || ""} {user?.lastName || user?.username || ""}
            </p>
            <p className="text-xs text-gray-400">
              {user?.email}
              {isAdmin && <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">Admin</span>}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <i className="bx bx-loader-alt bx-spin mr-2"></i>
          ) : (
            <i className="bx bx-log-out mr-2"></i>
          )}
          Logout
        </Button>
      </div>
    </aside>
  );
}
