import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default(UserRole.USER),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Agents table
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  category: text("category").notNull(),
  features: text("features").notNull(),
  isPopular: boolean("is_popular").default(false),
  isNew: boolean("is_new").default(false),
  isEnterprise: boolean("is_enterprise").default(false),
  iconClass: text("icon_class").notNull(), // CSS class for the icon
  iconBgClass: text("icon_bg_class").notNull(), // CSS class for the icon background
  gradientClass: text("gradient_class").notNull(), // CSS class for the gradient header
  teamId: integer("team_id").references(() => agentTeams.id),
  teamRole: text("team_role"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agent Teams table
export const agentTeams = pgTable("agent_teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(), // in cents
  target: text("target").notNull(), // e.g., "Law Firms, Compliance Teams, Enterprises"
  impact: text("impact").notNull(), // e.g., "Saves 80% of time in contract drafting & legal research"
  workflow: json("workflow").notNull(), // JSON describing how agents work together
  iconClass: text("icon_class").notNull(),
  gradientClass: text("gradient_class").notNull(),
  isPopular: boolean("is_popular").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team Subscriptions table
export const teamSubscriptions = pgTable("team_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  teamId: integer("team_id").notNull().references(() => agentTeams.id),
  status: text("status").notNull(), // active, canceled, expired
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripePriceId: text("stripe_price_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  status: text("status").notNull(), // active, canceled, expired
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripePriceId: text("stripe_price_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workflow Requests table
export const workflowRequests = pgTable("workflow_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  complexity: text("complexity").notNull(), // basic, advanced, enterprise
  integrations: text("integrations"), // comma-separated list of integrations
  status: text("status").notNull(), // pending, approved, rejected, completed
  teamId: integer("team_id").references(() => agentTeams.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  email: z.string().email("Invalid email format"),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const insertAgentTeamSchema = createInsertSchema(agentTeams).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSubscriptionSchema = createInsertSchema(teamSubscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertWorkflowRequestSchema = createInsertSchema(workflowRequests).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type InsertAgentTeam = z.infer<typeof insertAgentTeamSchema>;
export type InsertTeamSubscription = z.infer<typeof insertTeamSubscriptionSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertWorkflowRequest = z.infer<typeof insertWorkflowRequestSchema>;
export type User = typeof users.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type AgentTeam = typeof agentTeams.$inferSelect;
export type TeamSubscription = typeof teamSubscriptions.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type WorkflowRequest = typeof workflowRequests.$inferSelect;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
