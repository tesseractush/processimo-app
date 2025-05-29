import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function StatsGrid() {
  const { data: userAgents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ["/api/user/agents"],
  });
  
  // This would typically come from the API, using mock data for now
  const stats = {
    activeAgents: userAgents?.length || 0,
    automationsRun: 256,
    timeSaved: "18h",
    subscription: "Pay as you go"
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Active Agents</h2>
          <span className="p-2 bg-blue-100 rounded-full text-blue-600">
            <i className="bx bx-bot"></i>
          </span>
        </div>
        {isLoadingAgents ? (
          <div className="h-8 flex items-center mt-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.activeAgents}</p>
        )}
        {!isLoadingAgents && userAgents && userAgents.length > 0 && (
          <p className="mt-2 text-sm text-green-600 flex items-center">
            <i className="bx bx-up-arrow-alt"></i>
            <span className="ml-1">+{Math.max(1, Math.floor(userAgents.length / 2))} from last month</span>
          </p>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Automations Run</h2>
          <span className="p-2 bg-green-100 rounded-full text-green-600">
            <i className="bx bx-play-circle"></i>
          </span>
        </div>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.automationsRun}</p>
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <i className="bx bx-up-arrow-alt"></i>
          <span className="ml-1">+24% from last week</span>
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Time Saved</h2>
          <span className="p-2 bg-purple-100 rounded-full text-purple-600">
            <i className="bx bx-time"></i>
          </span>
        </div>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.timeSaved}</p>
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <i className="bx bx-up-arrow-alt"></i>
          <span className="ml-1">Saved this month</span>
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Subscription</h2>
          <span className="p-2 bg-yellow-100 rounded-full text-yellow-600">
            <i className="bx bx-credit-card"></i>
          </span>
        </div>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.subscription}</p>
        <p className="mt-2 text-sm text-gray-500 flex items-center">
          <span>Pay only for what you use</span>
        </p>
      </div>
    </div>
  );
}
