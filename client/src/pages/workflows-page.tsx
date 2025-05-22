import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkflowRequest } from "@shared/schema";
import { useState } from "react";
import CustomRequestModal from "@/components/dashboard/custom-request-modal";

export default function WorkflowsPage() {
  const { user } = useAuth();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  const { data: workflowRequests = [], isLoading } = useQuery<WorkflowRequest[]>({
    queryKey: ["/api/user/workflow-requests"],
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Requests</h1>
              <p className="text-gray-600 mt-1">Request custom workflows for your specific automation needs.</p>
            </div>
            <Button onClick={() => setIsRequestModalOpen(true)}>
              <i className="bx bx-plus mr-2"></i>
              New Request
            </Button>
          </header>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : workflowRequests && workflowRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workflowRequests.map((request: WorkflowRequest) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{request.name}</CardTitle>
                      {getStatusBadge(request.status)}
                    </div>
                    <CardDescription>
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{request.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{request.complexity}</Badge>
                      {request.integrations?.split(',').map((integration, index) => (
                        <Badge key={index} variant="outline">{integration.trim()}</Badge>
                      ))}
                    </div>
                    {request.status === "completed" && (
                      <Button className="w-full">
                        <i className="bx bx-play-circle mr-2"></i>
                        Run Workflow
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-6">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="bx bx-flow text-blue-600 text-3xl"></i>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflow Requests Yet</h3>
                <p className="text-gray-600 mb-6">Create a custom workflow request to get started.</p>
                <Button onClick={() => setIsRequestModalOpen(true)}>
                  Create Request
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <CustomRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)} 
      />
    </div>
  );
}
