import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAgentSchema, insertWorkflowRequestSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // API Endpoints
  
  // Get all agent teams
  app.get("/api/agent-teams", (req, res) => {
    res.json([
      {
        id: 1,
        name: "LexiSuite",
        description: "AI-powered legal document generation.",
        category: "Legal",
        price: 9999,
        target: "Law Firms",
        impact: "Saves 80% of time",
        workflow: {},
        iconClass: "bx-gavel",
        gradientClass: "from-blue-500 to-blue-700",
        isPopular: true,
        isFeatured: true
      }
    ]);
  });
  
  // Get featured agent teams
  app.get("/api/agent-teams/featured", async (req, res) => {
    try {
      const featuredTeams = await storage.getFeaturedAgentTeams();
      res.json(featuredTeams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured agent teams" });
    }
  });
  
  // Get specific agent team
  app.get("/api/agent-teams/:id", async (req, res) => {
    const teamId = parseInt(req.params.id);
    if (isNaN(teamId)) {
      return res.status(400).json({ message: "Invalid team ID" });
    }
    
    try {
      const team = await storage.getAgentTeamById(teamId);
      if (!team) {
        return res.status(404).json({ message: "Agent team not found" });
      }
      
      // Get agents in this team
      const agents = await storage.getTeamAgents(teamId);
      
      res.json({ team, agents });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent team" });
    }
  });
  
  // Get all agents
  app.get("/api/agents", (req, res) => {
    res.json([
      {
        id: 1,
        name: "Email Assistant",
        description: "Automate email management.",
        price: 999,
        category: "Communication",
        features: "Auto-reply, sort, filter",
        isPopular: true,
        isNew: false,
        isEnterprise: false,
        iconClass: "bx-envelope",
        iconBgClass: "bg-blue-100",
        gradientClass: "from-blue-500 to-blue-600"
      }
      // ...add more agents as needed
    ]);
  });

  // Get featured agents
  app.get("/api/agents/featured", async (req, res) => {
    try {
      const featuredAgents = await storage.getFeaturedAgents();
      res.json(featuredAgents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured agents" });
    }
  });

  // Get user's subscribed agents
  app.get("/api/user/agents", (req, res) => {
    res.json([
      {
        id: 1,
        name: "Email Assistant",
        description: "Automate email management.",
        price: 999,
        category: "Communication",
        features: "Auto-reply, sort, filter",
        isPopular: true,
        isNew: false,
        isEnterprise: false,
        iconClass: "bx-envelope",
        iconBgClass: "bg-blue-100",
        gradientClass: "from-blue-500 to-blue-600"
      }
    ]);
  });
  
  // Get user's subscriptions
  app.get("/api/user/subscriptions", (req, res) => {
    res.json([
      {
        id: 1,
        agentId: 1,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: null
      }
    ]);
  });

  // Create Stripe payment intent for agent subscription
  app.post("/api/agents/:id/create-payment-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const agentId = parseInt(req.params.id);
    if (isNaN(agentId)) {
      return res.status(400).json({ message: "Invalid agent ID" });
    }
    
    try {
      // Check if agent exists
      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Check if user is already subscribed
      const existingSubscription = await storage.getSubscription(req.user.id, agentId);
      if (existingSubscription) {
        return res.status(400).json({ message: "Already subscribed to this agent" });
      }
      
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: agent.price, // Agent price is already in cents
        currency: "usd",
        metadata: {
          userId: req.user.id.toString(),
          agentId: agentId.toString(),
          productName: agent.name
        }
      });
      
      // Create a pending subscription
      const subscription = await storage.createSubscription({
        userId: req.user.id,
        agentId: agentId,
        status: "pending",
        startDate: new Date(),
        stripePaymentIntentId: paymentIntent.id
      });
      
      // Update the subscription with payment intent
      await storage.updateSubscriptionStripeInfo(subscription.id, {
        stripePaymentIntentId: paymentIntent.id
      });
      
      res.status(201).json({ 
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment for agent subscription" });
    }
  });
  
  // Complete agent subscription after payment
  app.post("/api/subscriptions/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const subscriptionId = parseInt(req.params.id);
    if (isNaN(subscriptionId)) {
      return res.status(400).json({ message: "Invalid subscription ID" });
    }
    
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID is required" });
    }
    
    try {
      // Retrieve the payment intent from Stripe to confirm payment
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment has not been completed" });
      }
      
      // Get subscription
      const subscription = await storage.getSubscriptionById(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      // Update subscription with payment info
      await storage.updateSubscriptionStripeInfo(subscriptionId, {
        stripePaymentIntentId: paymentIntentId
      });
      
      // Update subscription status separately
      const updatedSubscription = await storage.updateSubscriptionStatus(subscriptionId, "active");
      
      // Ensure user has a Stripe customer ID
      if (!req.user.stripeCustomerId) {
        // Create a Stripe customer
        const customer = await stripe.customers.create({
          name: req.user.username,
          email: req.user.email,
          metadata: {
            userId: req.user.id.toString()
          }
        });
        
        // Update user with Stripe customer ID
        await storage.updateUserStripeInfo(req.user.id, {
          stripeCustomerId: customer.id
        });
      }
      
      res.status(200).json(updatedSubscription);
    } catch (error) {
      console.error('Subscription completion error:', error);
      res.status(500).json({ message: "Failed to complete subscription" });
    }
  });
  
  // Cancel subscription
  app.post("/api/subscriptions/:id/cancel", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const subscriptionId = parseInt(req.params.id);
    if (isNaN(subscriptionId)) {
      return res.status(400).json({ message: "Invalid subscription ID" });
    }
    
    try {
      const canceledSubscription = await storage.cancelSubscription(subscriptionId);
      if (!canceledSubscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      // If there's a Stripe subscription ID, cancel it in Stripe too
      if (canceledSubscription.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(canceledSubscription.stripeSubscriptionId);
      }
      
      res.status(200).json(canceledSubscription);
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Create workflow request
  app.post("/api/workflow-requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const validatedData = insertWorkflowRequestSchema.parse({
        ...req.body,
        userId: req.user.id,
        status: "pending"
      });
      
      const workflowRequest = await storage.createWorkflowRequest(validatedData);
      res.status(201).json(workflowRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workflow request" });
    }
  });

  // Get user workflow requests
  app.get("/api/user/workflow-requests", (req, res) => {
    res.json([
      {
        id: 1,
        userId: 1,
        name: "Contract Automation",
        description: "Automate contract creation.",
        complexity: "basic",
        integrations: "Email, Slack",
        status: "pending",
        teamId: 1,
        priority: "5",
        createdAt: new Date().toISOString()
      }
    ]);
  });

  // Dummy API for dashboard stats
  app.get("/api/user/stats", (req, res) => {
    res.json({
      activeAgents: 3,
      automationsRun: 256,
      timeSaved: "18h",
      subscription: "Pay as you go"
    });
  });

  // Admin routes
  
  // Admin: Create agent
  app.post("/api/admin/agents", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const validatedData = insertAgentSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      const agent = await storage.createAgent(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  // Admin: Update agent
  app.patch("/api/admin/agents/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const agentId = parseInt(req.params.id);
    if (isNaN(agentId)) {
      return res.status(400).json({ message: "Invalid agent ID" });
    }
    
    try {
      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      const updatedAgent = await storage.updateAgent(agentId, req.body);
      res.json(updatedAgent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update agent" });
    }
  });

  // Admin: Delete agent
  app.delete("/api/admin/agents/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const agentId = parseInt(req.params.id);
    if (isNaN(agentId)) {
      return res.status(400).json({ message: "Invalid agent ID" });
    }
    
    try {
      const success = await storage.deleteAgent(agentId);
      if (!success) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  // Admin: Get all workflow requests
  app.get("/api/admin/workflow-requests", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const workflowRequests = await storage.getAllWorkflowRequests();
      res.json(workflowRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow requests" });
    }
  });

  // Admin: Update workflow request status
  app.patch("/api/admin/workflow-requests/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }
    
    const { status } = req.body;
    if (!status || !["pending", "approved", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    try {
      const updatedRequest = await storage.updateWorkflowRequestStatus(requestId, status);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Workflow request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workflow request" });
    }
  });

  app.get("/api/user", (req, res) => {
    res.json({
      id: 1,
      username: "testuser",
      email: "testuser@example.com",
      firstName: "Test",
      lastName: "User",
      role: "user"
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
