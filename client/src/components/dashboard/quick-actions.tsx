import { Link } from "wouter";

interface QuickActionsProps {
  onRequestCustom: () => void;
}

export default function QuickActions({ onRequestCustom }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
      </div>
      <div className="p-6 space-y-4">
        <Link href="/marketplace">
          <a className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="bx bx-store text-blue-600"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Explore Marketplace</h3>
                <p className="text-xs text-gray-500">Find new AI agents</p>
              </div>
            </div>
          </a>
        </Link>
        
        <Link href="/workflows">
          <a className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="bx bx-flow text-blue-600"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Workflows</h3>
                <p className="text-xs text-gray-500">Create and manage workflows</p>
              </div>
            </div>
          </a>
        </Link>
        
        <button 
          className="block w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
          onClick={onRequestCustom}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <i className="bx bx-plus text-gray-600"></i>
            </div>
            <div className="ml-3 text-left">
              <h3 className="text-sm font-medium text-gray-900">Custom Request</h3>
              <p className="text-xs text-gray-500">Request a new workflow</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
