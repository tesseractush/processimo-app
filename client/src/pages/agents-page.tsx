import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AgentsPage() {
  const { user } = useAuth();
  
  const { data: userAgents, isLoading } = useQuery({
    queryKey: ["/api/user/agents"],
  });
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My AI Agents</h1>
            <p className="text-gray-600 mt-1">Manage your active AI agents and workflows.</p>
          </header>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : userAgents && userAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userAgents.map((agent: Agent) => (
                <Card key={agent.id} className="overflow-hidden">
                  <div className={`h-3 bg-gradient-to-r ${agent.gradientClass}`}></div>
                  <CardHeader className="p-6 pb-3">
                    <div className="flex items-center mb-3">
                      <div className={`h-12 w-12 rounded-full ${agent.iconBgClass} flex items-center justify-center`}>
                        <i className={`bx ${agent.iconClass} text-xl text-primary`}></i>
                      </div>
                      <div className="ml-3">
                        <CardTitle>{agent.name}</CardTitle>
                        <div className="flex items-center mt-1">
                          {agent.isPopular && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Popular</Badge>
                          )}
                          {agent.isNew && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 ml-2">New</Badge>
                          )}
                          {agent.isEnterprise && (
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 ml-2">Enterprise</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="mt-2 mb-4">
                      <h3 className="text-sm font-medium text-gray-900">Features:</h3>
                      <p className="text-sm text-gray-600">{agent.features}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <Button className="w-full">
                        <i className="bx bx-play-circle mr-2"></i>
                        Run Agent
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-6">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="bx bx-bot text-blue-600 text-3xl"></i>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Agents Yet</h3>
                <p className="text-gray-600 mb-6">Subscribe to AI agents from our marketplace to get started.</p>
                <Button onClick={() => window.location.href = '/marketplace'}>
                  Explore Marketplace
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
