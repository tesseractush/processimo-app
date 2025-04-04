import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { AgentTeam } from "@shared/schema";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  useSpring, 
  useAnimationControls,
  AnimatePresence
} from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Users, 
  Sparkles, 
  Target,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AgentWorkforcePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  
  // Fetch agent teams
  const { data: agentTeams = [], isLoading } = useQuery<AgentTeam[]>({
    queryKey: ["/api/agent-teams"],
    enabled: !!user,
  });
  
  const nextTeam = () => {
    if (agentTeams.length === 0) return;
    setCurrentTeamIndex((prevIndex) => (prevIndex + 1) % agentTeams.length);
  };
  
  const prevTeam = () => {
    if (agentTeams.length === 0) return;
    setCurrentTeamIndex((prevIndex) => (prevIndex - 1 + agentTeams.length) % agentTeams.length);
  };
  
  // Start auto slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      nextTeam();
    }, 8000);
    
    return () => clearInterval(interval);
  }, [agentTeams.length]);
  
  if (isLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (agentTeams.length === 0) {
    return (
      <div className="container py-10">
        <div className="text-center py-20">
          <h3 className="text-2xl font-medium mb-2">No agent workforces available yet</h3>
          <p className="text-muted-foreground mb-6">
            Check back soon for specialized agent workforces
          </p>
        </div>
      </div>
    );
  }
  
  const currentTeam = agentTeams[currentTeamIndex];
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-indigo-600 text-transparent bg-clip-text">
            AI Agent Workforce
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Specialized teams of AI agents working together to solve complex problems for your business
          </p>
          
          <div className="flex justify-center gap-4 mb-20">
            <Button size="lg" className="shadow-lg">
              <Link to={`/teams/${currentTeam.id}`}>
                <span className="flex items-center">
                  Explore Workforces
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>
      
      {/* Carousel Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">Featured Agent Workforces</h2>
          <p className="text-center text-gray-600 mb-12">Swipe to explore our specialized AI agent teams</p>
          
          <div className="relative px-10 max-w-6xl mx-auto">
            <button 
              onClick={prevTeam}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <div className="overflow-hidden" ref={carouselRef}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTeam.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col md:flex-row items-center gap-10 p-8"
                >
                  {/* Team Card - Glass Effect */}
                  <motion.div
                    className="w-full md:w-1/2 relative h-[400px] rounded-2xl overflow-hidden backdrop-blur-md shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${currentTeam.gradientClass})`,
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-sm"></div>
                    <div className="relative z-10 h-full p-8 flex flex-col text-white">
                      <div className="flex items-center mb-6">
                        <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                          <i className={`bx ${currentTeam.iconClass} text-2xl`}></i>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-3xl font-bold">{currentTeam.name}</h3>
                          <p className="text-sm opacity-90">{currentTeam.category}</p>
                        </div>
                      </div>
                      
                      <p className="text-lg opacity-90 mb-6">{currentTeam.description}</p>
                      
                      <div className="flex items-center mb-4">
                        <Target className="h-5 w-5 mr-2 opacity-80" />
                        <p className="text-sm opacity-90">{currentTeam.target}</p>
                      </div>
                      
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 opacity-80" />
                        <p className="text-sm opacity-90">{currentTeam.impact}</p>
                      </div>
                      
                      <div className="mt-auto">
                        <p className="text-2xl font-bold mb-4">${(currentTeam.price / 100).toFixed(2)}<span className="text-sm font-normal opacity-90">/month</span></p>
                        
                        <Button
                          variant="outline"
                          className="bg-white bg-opacity-20 text-white border-white border-opacity-40 hover:bg-opacity-30"
                          asChild
                        >
                          <Link to={`/teams/${currentTeam.id}`}>
                            <span className="flex items-center">
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Team Info */}
                  <div className="w-full md:w-1/2 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-3">How It Works</h3>
                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, staggerChildren: 0.1 }}
                      >
                        {currentTeam.workflow && (currentTeam.workflow as any).steps && (currentTeam.workflow as any).steps.map((step: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex p-3 bg-white rounded-lg shadow-sm border"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground shrink-0 mr-3">
                              {step.step}
                            </div>
                            <div>
                              <p className="text-sm">{step.description}</p>
                              <p className="text-xs text-primary font-medium">{step.agent}</p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                    
                    <div className="flex justify-center mt-8 space-x-1">
                      {agentTeams.map((team, index) => (
                        <button
                          key={team.id}
                          onClick={() => setCurrentTeamIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentTeamIndex ? "bg-primary w-6" : "bg-gray-300"
                          }`}
                        ></button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <button
              onClick={nextTeam}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>
      
      {/* Value Proposition */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose AI Agent Workforces?</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our specialized teams of AI agents work together to handle complex business needs with unprecedented efficiency
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Specialized Expertise</h3>
              <p className="text-gray-600">
                Each agent in the workforce is trained on specific domains, creating unmatched collective intelligence.
              </p>
            </motion.div>
            
            <motion.div
              className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">10x Productivity</h3>
              <p className="text-gray-600">
                Intelligent workflows replace hours of manual work, delivering results in minutes rather than days.
              </p>
            </motion.div>
            
            <motion.div
              className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow" 
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Perfect Collaboration</h3>
              <p className="text-gray-600">
                Seamless handoffs between agents create a unified experience that feels like a single expert system.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-indigo-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your business?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Explore our AI Agent Workforces and discover how they can automate complex tasks for your team.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary" className="shadow-lg" asChild>
              <Link to="/teams">
                <span className="flex items-center">
                  Browse All Workforces
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}