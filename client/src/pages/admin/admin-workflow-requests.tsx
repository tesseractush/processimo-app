import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { WorkflowRequest } from "@shared/schema";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminWorkflowRequests() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: workflowRequests, isLoading } = useQuery<WorkflowRequest[]>({
    queryKey: ["/api/admin/workflow-requests"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/workflow-requests/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/workflow-requests"] });
      toast({
        title: "Status Updated",
        description: "Workflow request status has been updated successfully.",
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (request: WorkflowRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (status: string) => {
    if (selectedRequest) {
      updateStatusMutation.mutate({ id: selectedRequest.id, status });
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRequests = workflowRequests && workflowRequests.length > 0
    ? workflowRequests
        .filter((request: WorkflowRequest) =>
          (request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           request.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (statusFilter === "all" || request.status === statusFilter)
        )
        .sort((a: WorkflowRequest, b: WorkflowRequest) => {
          // Sort by created date (most recent first)
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
    : [];

  return (
    <AdminLayout 
      title="Workflow Requests" 
      subtitle="Manage workflow automation requests from users"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Name</TableHead>
                <TableHead>Complexity</TableHead>
                <TableHead>Integrations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request: WorkflowRequest) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">{request.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[250px]">
                        {request.description.length > 50
                          ? `${request.description.substring(0, 50)}...`
                          : request.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        request.complexity === "basic"
                          ? "bg-green-100 text-green-800"
                          : request.complexity === "advanced"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {request.complexity.charAt(0).toUpperCase() + request.complexity.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {request.integrations
                        ? request.integrations.split(", ").map((integration, index) => (
                            <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full mr-1 mb-1">
                              {integration}
                            </span>
                          ))
                        : "None"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {request.createdAt 
                        ? new Date(request.createdAt).toLocaleDateString() 
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchQuery || statusFilter !== "all"
                      ? "No workflow requests match your filters"
                      : "No workflow requests available"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Request Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Workflow Request Details</DialogTitle>
            <DialogDescription>
              Review the details and update the status of this request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedRequest.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Submitted on {selectedRequest.createdAt 
                          ? new Date(selectedRequest.createdAt).toLocaleDateString() 
                          : "N/A"}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1">{selectedRequest.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Complexity</h3>
                      <p className="mt-1 capitalize">{selectedRequest.complexity}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Integrations</h3>
                      <p className="mt-1">{selectedRequest.integrations || "None specified"}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
                    <div className="flex gap-2">
                      <Select
                        defaultValue={selectedRequest.status}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        disabled={updateStatusMutation.isPending}
                        onClick={() => handleStatusChange(selectedRequest.status)}
                      >
                        {updateStatusMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Status"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}