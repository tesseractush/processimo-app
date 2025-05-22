import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// Define the expected stats type
interface Stats {
  activeAgents: number;
  automationsRun: number;
  timeSaved: string;
  subscription: string;
}

export default function StatsGrid() {
  // Fetch all stats from backend
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/user/stats"],
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Active Agents</h2>
          <span className="p-2 bg-blue-100 rounded-full text-blue-600">
            <i className="bx bx-bot"></i>
          </span>
        </div>
        {isLoading ? (
          <div className="h-8 flex items-center mt-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.activeAgents ?? "-"}</p>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Automations Run</h2>
          <span className="p-2 bg-green-100 rounded-full text-green-600">
            <i className="bx bx-play-circle"></i>
          </span>
        </div>
        {isLoading ? (
          <div className="h-8 flex items-center mt-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.automationsRun ?? "-"}</p>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Time Saved</h2>
          <span className="p-2 bg-purple-100 rounded-full text-purple-600">
            <i className="bx bx-time"></i>
          </span>
        </div>
        {isLoading ? (
          <div className="h-8 flex items-center mt-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.timeSaved ?? "-"}</p>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Subscription</h2>
          <span className="p-2 bg-yellow-100 rounded-full text-yellow-600">
            <i className="bx bx-credit-card"></i>
          </span>
        </div>
        {isLoading ? (
          <div className="h-8 flex items-center mt-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.subscription ?? "-"}</p>
        )}
      </div>
    </div>
  );
}
