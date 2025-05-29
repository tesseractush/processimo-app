import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { AgentTeam } from "@shared/schema";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  useAnimationControls,
  AnimatePresence
} from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Search,
  Loader2,
  Target,
  TrendingUp,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AgentWorkforcePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTeamId, setActiveTeamId] = useState<number | null>(null);
  
  // Fetch agent teams
  const { data: agentTeams = [], isLoading } = useQuery<AgentTeam[]>({
    queryKey: ["/api/agent-teams"],
    enabled: !!user,
  });
  
  // Set active team when data loads
  useEffect(() => {
    if (agentTeams.length > 0 && !activeTeamId) {
      setActiveTeamId(agentTeams[0].id);
    }
  }, [agentTeams, activeTeamId]);
  
  // Filter teams based on search query
  const filteredTeams = searchQuery ? 
    agentTeams.filter((team) => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      team.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      team.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : agentTeams;
  
  // Create categories
  const categoriesSet = new Set<string>();
  agentTeams.forEach((team) => {
    if (team.category) {
      categoriesSet.add(team.category);
    }
  });
  const categories = Array.from(categoriesSet);
  
  // Team card component with glassmorphic effect
  const TeamCard = ({ team }: { team: AgentTeam }) => {
    // Card animation values
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const posX = e.clientX - rect.left;
      const posY = e.clientY - rect.top;
      const relativeX = posX / rect.width;
      const relativeY = posY / rect.height;
      
      mouseX.set(relativeX);
      mouseY.set(relativeY);
      
      x.set((relativeX - 0.5) * 10);
      y.set((relativeY - 0.5) * 10);
    };
    
    const rotateX = useTransform(y, [-10, 10], [5, -5]);
    const rotateY = useTransform(x, [-10, 10], [-5, 5]);
    
    return (
      <motion.div
        className="overflow-hidden h-full"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="relative h-full rounded-xl overflow-hidden border shadow-md"
          style={{
            background: `linear-gradient(135deg, ${team.gradientClass})`,
            rotateX,
            rotateY,
            perspective: "1000px"
          }}
          onMouseMove={handleMouseMove}
          animate={{ scale: 1 }}
          initial={{ scale: 0.95 }}
        >
          {/* Glassmorphic overlay */}
          <div className="absolute inset-0 bg-white bg-opacity-15 backdrop-blur-[1px]"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full p-6 flex flex-col text-white">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <i className={`bx ${team.iconClass} text-2xl`}></i>
              </div>
              <div className="ml-3">
                <h3 className="text-xl font-bold">{team.name}</h3>
                <p className="text-sm opacity-90">{team.category}</p>
              </div>
            </div>
            
            <p className="text-sm opacity-90 mb-4">{team.description}</p>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-start">
                <Target className="h-4 w-4 mt-0.5 mr-2 shrink-0 opacity-80" />
                <p className="text-xs opacity-90">{team.target}</p>
              </div>
              
              <div className="flex items-start">
                <TrendingUp className="h-4 w-4 mt-0.5 mr-2 shrink-0 opacity-80" />
                <p className="text-xs opacity-90">{team.impact}</p>
              </div>
            </div>
            
            <div className="mt-auto">
              <p className="text-xl font-bold mb-2">${(team.price / 100).toFixed(2)}<span className="text-sm ml-1 font-normal opacity-90">/month</span></p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full border-white border-opacity-30 bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                  onClick={() => {
                    toast({
                      title: "Coming soon!",
                      description: "Team subscriptions will be available soon.",
                    });
                  }}
                >
                  Subscribe
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="shrink-0 shadow-md"
                  asChild
                >
                  <Link to={`/teams/${team.id}`}>
                    <span className="flex items-center">
                      Details
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  // Section for the selected team's workflow
  const WorkflowSection = () => {
    const activeTeam = agentTeams.find(team => team.id === activeTeamId);
    
    if (!activeTeam) return null;
    
    const workflowSteps = activeTeam.workflow ? (activeTeam.workflow as any).steps || [] : [];
    
    return (
      <Card className="mb-8 overflow-hidden border-none shadow-lg">
        <div className={`h-1 w-full bg-gradient-to-r ${activeTeam.gradientClass}`}></div>
        <CardHeader className="pb-2 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl flex items-center">
                <i className={`bx ${activeTeam.iconClass} text-primary mr-2`}></i>
                {activeTeam.name} Workflow
              </CardTitle>
              <CardDescription>{activeTeam.description}</CardDescription>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 md:mt-0"
              asChild
            >
              <Link to={`/teams/${activeTeam.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative">
            {/* Connector Line */}
            <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-gray-200 z-0"></div>
            
            <div className="space-y-4 relative z-10">
              {workflowSteps.map((step: any, index: number) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground shrink-0 mr-4 z-10">
                    {step.step}
                  </div>
                  <div className="bg-card rounded-lg p-3 border shadow-sm flex-1">
                    <p className="mb-1 text-sm">{step.description}</p>
                    <Badge variant="secondary">
                      {step.agent}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-right">
          <div className="ml-auto flex gap-3">
            {agentTeams.slice(0, 5).map((team) => (
              <button
                key={team.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  team.id === activeTeamId
                    ? `bg-primary text-white`
                    : `bg-gray-100 text-gray-500 hover:bg-gray-200`
                }`}
                onClick={() => setActiveTeamId(team.id)}
                title={team.name}
              >
                <i className={`bx ${team.iconClass} text-sm`}></i>
              </button>
            ))}
          </div>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">AI Agent Workforce</h1>
            <p className="text-gray-600 mt-1">
              Specialized teams of AI agents working together to solve complex problems
            </p>
          </header>
          
          {/* Active Team Workflow */}
          <WorkflowSection />
          
          {/* Search and filter */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search workforces by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTeams.length > 0 ? (
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTeams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              </TabsContent>
              
              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams
                      .filter((team) => team.category === category)
                      .map((team) => (
                        <TeamCard key={team.id} team={team} />
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card className="mt-6">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="bx bx-search text-blue-600 text-3xl"></i>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Agent Workforces Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? 
                    `We couldn't find any workforces matching "${searchQuery}"` : 
                    "There are no agent workforces available at the moment."}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}