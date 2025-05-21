import { Agent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MarketplacePreviewProps {
  agents: Agent[];
}

export default function MarketplacePreview({ agents }: MarketplacePreviewProps) {
  const { toast } = useToast();
  const featuredAgents = agents.slice(0, 3); // Show only the first 3 agents
  
  const { data: userAgents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/user/agents"],
  });
  
  const subscribeMutation = useMutation({
    mutationFn: async (agentId: number) => {
      const res = await apiRequest("POST", `/api/agents/${agentId}/subscribe`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/agents"] });
      toast({
        title: "Subscription successful",
        description: "You have successfully subscribed to this agent.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const isSubscribed = (agentId: number) => {
    return userAgents?.some((agent: Agent) => agent.id === agentId);
  };
  
  const handleSubscribe = (agentId: number) => {
    subscribeMutation.mutate(agentId);
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Featured Agents</h2>
        <Link href="/marketplace">
          <a className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View all →
          </a>
        </Link>
      </div>
      
      {featuredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAgents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className={`bg-gradient-to-r ${agent.gradientClass} h-3`}></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`h-12 w-12 rounded-full ${agent.iconBgClass} flex items-center justify-center`}>
                    <i className={`bx ${agent.iconClass} text-xl text-primary`}></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <i className="bx bxs-star text-yellow-400 text-sm"></i>
                        <i className="bx bxs-star text-yellow-400 text-sm"></i>
                        <i className="bx bxs-star text-yellow-400 text-sm"></i>
                        <i className="bx bxs-star text-yellow-400 text-sm"></i>
                        <i className="bx bxs-star-half text-yellow-400 text-sm"></i>
                      </div>
                      <span className="text-xs text-gray-500 ml-1">({Math.floor(Math.random() * 100) + 50})</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-900">${(agent.price / 100).toFixed(2)}/month</span>
                  {agent.isPopular && (
                    <Badge className="bg-green-100 text-green-800">Popular</Badge>
                  )}
                  {agent.isNew && (
                    <Badge className="bg-blue-100 text-blue-800">New</Badge>
                  )}
                  {agent.isEnterprise && (
                    <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
                  )}
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleSubscribe(agent.id)}
                  disabled={isSubscribed(agent.id) || subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending && subscribeMutation.variables === agent.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubscribed(agent.id) ? 'Already Subscribed' : 'Subscribe'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No featured agents available at the moment.</p>
          <Button className="mt-4" asChild>
            <Link href="/marketplace">Browse Marketplace</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
