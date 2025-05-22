import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkflowRequestSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useState } from "react";

interface CustomRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Extend the workflow request schema with form-specific validation
const formSchema = insertWorkflowRequestSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Please provide a detailed description"),
  priority: z.number().min(1).max(10),
  emailIntegration: z.boolean().optional(),
  slackIntegration: z.boolean().optional(),
  sheetsIntegration: z.boolean().optional(),
  otherIntegration: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomRequestModal({ isOpen, onClose }: CustomRequestModalProps) {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<string[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      complexity: "basic",
      priority: 5,
      emailIntegration: false,
      slackIntegration: false,
      sheetsIntegration: false,
      otherIntegration: false,
    }
  });
  
  const workflowRequestMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Combine integration checkboxes into a comma-separated string
      const integrations = [];
      if (data.emailIntegration) integrations.push("Email");
      if (data.slackIntegration) integrations.push("Slack");
      if (data.sheetsIntegration) integrations.push("Google Sheets");
      if (data.otherIntegration) integrations.push("Other");
      
      const requestData = {
        name: data.name,
        description: data.description,
        complexity: data.complexity,
        priority: data.priority,
        integrations: integrations.join(", ")
      };
      
      const res = await apiRequest("POST", "/api/workflow-requests", requestData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/workflow-requests"] });
      toast({
        title: "Request Submitted",
        description: "Your workflow request has been submitted successfully.",
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormValues) => {
    workflowRequestMutation.mutate(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Custom Workflow Request</DialogTitle>
          <DialogDescription>
            Tell us what you need and our team will create a custom workflow for you.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request-name">Request Name</Label>
            <Input 
              id="request-name" 
              placeholder="E.g., Email Processing Workflow" 
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="request-description">Description</Label>
            <Textarea 
              id="request-description" 
              placeholder="Describe your automation needs in detail..." 
              rows={4}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="complexity">Complexity Level</Label>
            <Select 
              defaultValue="basic"
              onValueChange={(value) => form.setValue("complexity", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select complexity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (Simple 3-step workflow)</SelectItem>
                <SelectItem value="advanced">Advanced (Multi-step workflow with integrations)</SelectItem>
                <SelectItem value="enterprise">Enterprise (Complex workflow with multiple integrations)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select 
              defaultValue="5"
              onValueChange={(value) => form.setValue("priority", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Highest Priority</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5 - Medium Priority</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="10">10 - Lowest Priority</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">1 is the highest priority, 10 is the lowest</p>
          </div>
          
          <div className="space-y-2">
            <Label>Integrations Needed</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="integration-email" 
                  {...form.register("emailIntegration")}
                />
                <Label htmlFor="integration-email">Email</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="integration-slack" 
                  {...form.register("slackIntegration")}
                />
                <Label htmlFor="integration-slack">Slack</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="integration-sheets" 
                  {...form.register("sheetsIntegration")}
                />
                <Label htmlFor="integration-sheets">Google Sheets</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="integration-other" 
                  {...form.register("otherIntegration")}
                />
                <Label htmlFor="integration-other">Other (Specify in description)</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={workflowRequestMutation.isPending}
            >
              {workflowRequestMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
