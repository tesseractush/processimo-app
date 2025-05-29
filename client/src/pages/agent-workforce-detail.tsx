import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { AgentTeam, Agent } from "@shared/schema";
import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { 
  ArrowLeft, 
  Users, 
  Building, 
  ListChecks, 
  ArrowUpRight, 
  ChevronRight,
  Target,
  TrendingUp,
  ArrowRight,
  Globe,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WorkflowStep = {
  step: number;
  description: string;
  agent: string;
};

export default function AgentWorkforceDetail() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [teamId, setTeamId] = useState<number | null>(null);
  const flowchartRef = useRef<HTMLDivElement>(null);
  const isFlowchartInView = useInView(flowchartRef, { once: true, amount: 0.3 });
  
  // Extract team ID from URL
  useEffect(() => {
    const match = location.match(/\/teams\/(\d+)/);
    if (match && match[1]) {
      setTeamId(parseInt(match[1]));
    }
  }, [location]);
  
  // Fetch team data
  const { data: teamData, isLoading, error } = useQuery<{ team: AgentTeam, agents: Agent[] }>({
    queryKey: [`/api/agent-teams/${teamId}`],
    enabled: !!teamId && !!user,
  });
  
  const team = teamData?.team;
  const agents = teamData?.agents || [];
  
  const workflowSteps: WorkflowStep[] = team?.workflow ? (team.workflow as any).steps || [] : [];
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error || !team ? (
          <div className="p-6">
            <div className="max-w-3xl mx-auto text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Workforce not found</h2>
              <p className="text-black-500 mb-6">The agent workforce you're looking for might have been removed or doesn't exist.</p>
              <Button asChild>
                <Link to="/agent-workforce">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Agent Workforces
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white">
            {/* Hero Section */}
            <section 
              className="relative py-20 px-6 overflow-hidden" 
              style={{
                background: `linear-gradient(135deg, ${team.gradientClass})`,
              }}
            >
              <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-[2px]"></div>
              
              {/* Abstract shapes */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white bg-opacity-50 blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white bg-opacity-50 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white bg-opacity-30 blur-3xl"></div>
              </div>
              
              <div className="container mx-auto relative z-10">
                <Button variant="ghost" className="mb-8 text-black bg-white bg-opacity-20 hover:bg-opacity-30" asChild>
                  <Link to="/agent-workforce">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Agent Workforces
                  </Link>
                </Button>
                
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                  <div className="flex-1">
                    <motion.h1 
                      className="text-4xl md:text-5xl font-bold mb-4 text-black"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      {team.name}
                    </motion.h1>
                    
                    <motion.p 
                      className="text-xl text-black text-opacity-90 mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    >
                      {team.description}
                    </motion.p>
                    
                    <motion.div 
                      className="flex items-center mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <Target className="h-5 w-5 mr-2 text-black text-opacity-80" />
                      <p className="text-black text-opacity-90">{team.target}</p>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <TrendingUp className="h-5 w-5 mr-2 text-black text-opacity-80" />
                      <p className="text-black text-opacity-90">{team.impact}</p>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="md:w-1/3 p-6 bg-white bg-opacity-20 backdrop-blur-md rounded-xl shadow-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                        <i className={`bx ${team.iconClass} text-2xl text-white`}></i>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-bold text-black">Pricing</h3>
                        <p className="text-3xl font-bold text-black">${(team.price / 100).toFixed(2)}</p>
                        <p className="text-sm text-black text-opacity-90">per month</p>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      <li className="flex text-black">
                        <ChevronRight className="h-5 w-5 mr-2 shrink-0" />
                        <span>Includes all {agents.length} specialized agents</span>
                      </li>
                      <li className="flex text-black">
                        <ChevronRight className="h-5 w-5 mr-2 shrink-0" />
                        <span>Complete workflow automation</span>
                      </li>
                      <li className="flex text-black">
                        <ChevronRight className="h-5 w-5 mr-2 shrink-0" />
                        <span>Seamless agent communication</span>
                      </li>
                      <li className="flex text-black">
                        <ChevronRight className="h-5 w-5 mr-2 shrink-0" />
                        <span>Regular AI model updates</span>
                      </li>
                    </ul>
                    
                    <Button 
                      className="w-full shadow-xl bg-white hover:bg-gray-100 text-gray-800"
                      onClick={() => {
                        toast({
                          title: "Coming soon!",
                          description: "Team subscriptions will be available soon.",
                        });
                      }}
                    >
                      Subscribe to Workforce
                    </Button>
                  </motion.div>
                </div>
              </div>
            </section>
            
            {/* Workflow Visualization Section */}
            <section className="py-16 px-6 bg-white" ref={flowchartRef}>
              <div className="container mx-auto">
                <h2 className="text-3xl font-bold mb-2 text-center">How {team.name} Works</h2>
                <p className="text-gray-600 text-center mb-12">An intelligent workflow of specialized AI agents working together</p>
                
                <div className="relative">
                  {/* Connector Line */}
                  <motion.div 
                    className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-400 z-0"
                    style={{ height: "100%" }}
                  ></motion.div>
                  
                  <div className="space-y-16 relative z-10">
                    {workflowSteps.map((step, index) => (
                      <motion.div 
                        key={index}
                        className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} gap-8`}
                        initial={{ opacity: 1, y: 50 }}
                        animate={isFlowchartInView ? { opacity: 1, y: 1 } : {}}
                        transition={{ duration: 0, delay: 0 + index * 0 }}
                      >
                        <div className="flex-1 md:max-w-md">
                          <motion.div 
                            className="relative p-6 bg-white border rounded-xl shadow-lg overflow-hidden"
                            whileHover={{ 
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                              y: -5 
                            }}
                          >
                            {/* Background pattern */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gray-100 rounded-full -mt-10 -mr-10 opacity-30"></div>
                            
                            <div className="relative z-10">
                              <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center font-bold mb-4">
                                {step.step}
                              </div>
                              <h3 className="text-lg font-bold mb-2">{step.agent}</h3>
                              <p className="text-black-600">{step.description}</p>
                              
                              {/* Find the relevant agent */}
                              {agents.find(agent => agent.name === step.agent) && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <p className="text-sm text-primary font-medium flex items-center">
                                    <span>Agent details</span>
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </div>
                        
                        <div className="relative">
                          <motion.div 
                            className="w-12 h-12 rounded-full bg-white border-4 border-primary flex items-center justify-center z-20 relative"
                          >
                            {index < workflowSteps.length - 1 ? (
                              <ArrowRight className={`h-6 w-6 text-primary ${index % 2 === 0 ? "rotate-0" : "rotate-180"}`} />
                            ) : (
                              <Globe className="h-6 w-6 text-primary" />
                            )}
                          </motion.div>
                          {/* Horizontal connector */}
                          <motion.div 
                            className={`absolute top-1/2 transform -translate-y-1/2 h-1 bg-primary z-10 ${
                              index % 2 === 0 ? "right-12" : "left-12"
                            }`}
                            style={{ width: "10rem", maxWidth: "10rem" }}
                          ></motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            
            {/* Team Agents Section */}
            <section className="py-16 px-6 bg-gray-50">
              <div className="container mx-auto">
                <h2 className="text-3xl font-bold mb-2 text-center">Meet the {team.name} Agents</h2>
                <p className="text-black-600 text-center mb-12">Specialized AI agents working together in perfect harmony</p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {agents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ 
                        y: -8,
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      }}
                      className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300"
                    >
                      <div 
                        className="h-2 w-full"
                        style={{ 
                          background: `linear-gradient(to right, ${agent.gradientClass})` 
                        }}
                      ></div>
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className={`w-10 h-10 rounded-full ${agent.iconBgClass} flex items-center justify-center`}>
                            <i className={`bx ${agent.iconClass} text-xl`}></i>
                          </div>
                          <div className="ml-3">
                            <h3 className="font-bold">{agent.name}</h3>
                            <p className="text-sm text-muted-foreground">{agent.teamRole}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-black-600 mb-4">{agent.description}</p>
                        
                        <div className="text-sm text-black-500 pt-3 border-t">
                          <strong>Features:</strong> {agent.features}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
            
            {/* CTA Section */}
            <section className="py-12 px-6 bg-gradient-to-r from-primary to-indigo-600 text-black">
              <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to transform your business?</h2>
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                  Get started with {team.name} today and revolutionize your workflow.
                </p>
                <div className="flex justify-center gap-4">
                  <Button size="lg" variant="secondary" className="shadow-lg" onClick={() => {
                    toast({
                      title: "Coming soon!",
                      description: "Team subscriptions will be available soon.",
                    });
                  }}>
                    Subscribe Now
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white bg-opacity-10 border-white border-opacity-30 hover:bg-opacity-20" asChild>
                    <Link to="/agent-workforce">
                      Browse More Workforces
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}