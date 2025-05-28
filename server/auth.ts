import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, UserRole } from "@shared/schema";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "processimo-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    }
  };

  // Trust proxy is needed for OAuth and sessions behind Replit proxy
  app.set("trust proxy", true);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy using email instead of username
  passport.use(
    new LocalStrategy(
      { usernameField: "identifier" },
      async (identifier, password, done) => {
        try {
          let user = null;
          // Check if the identifier is likely an email
          if (identifier.includes("@")) {
            user = await storage.getUserByEmail(identifier);
          } else {
            // Otherwise, assume it's a username
            user = await storage.getUserByUsername(identifier);
          }

          // If no user found or password doesn't match
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid credentials" }); // Generic error message for security
          }
          // Authentication successful
          return done(null, user);
        } catch (error) {
          return done(error); // Handle potential database errors
        }
      },
    ),
  );
  
  // Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "https://processimo.replit.app/api/auth/google/callback",
        scope: ["profile", "email"],
        proxy: true,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        try {
          // Check if user already exists with this Google ID
          const email = profile.emails && profile.emails[0]?.value;
          
          if (!email) {
            return done(new Error("Email not provided by Google"));
          }
          
          let user = await storage.getUserByEmail(email);
          
          if (user) {
            // User exists, log them in
            return done(null, user);
          } else {
            // Create a new user with Google profile data
            const firstName = profile.name?.givenName || "";
            const lastName = profile.name?.familyName || "";
            const username = `google_${profile.id}`;
            
            // Generate a random secure password for the user
            // They won't use this password since they'll login via Google
            const randomPassword = randomBytes(16).toString("hex");
            
            user = await storage.createUser({
              username,
              email,
              password: await hashPassword(randomPassword),
              firstName,
              lastName,
              role: UserRole.USER,
            });
            
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  // GitHub OAuth strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: "https://processimo.replit.app/api/auth/github/callback",
        scope: ["user:email"],
        proxy: true,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        try {
          // GitHub might not provide email directly in profile
          // We use the primary email from the emails array
          const emails = profile.emails;
          const email = emails && emails.find((e: any) => e.primary)?.value || 
                         emails?.[0]?.value || 
                         `${profile.username}@github.user`;
          
          let user = await storage.getUserByEmail(email);
          
          if (user) {
            // User exists, log them in
            return done(null, user);
          } else {
            // Parse name into firstName and lastName if available
            let firstName = "";
            let lastName = "";
            
            if (profile.displayName) {
              const nameParts = profile.displayName.split(" ");
              firstName = nameParts[0] || "";
              lastName = nameParts.slice(1).join(" ") || "";
            }
            
            // Use GitHub username if available, otherwise create one
            const username = profile.username || `github_${profile.id}`;
            
            // Generate a random secure password for the user
            const randomPassword = randomBytes(16).toString("hex");
            
            user = await storage.createUser({
              username,
              email,
              password: await hashPassword(randomPassword),
              firstName,
              lastName,
              role: UserRole.USER,
            });
            
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, username, password, firstName, lastName } = req.body;
      
      // Check if user with email already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Check if user with username already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create new user
      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
        role: UserRole.USER,
      });

      // Log user in after registration
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Don't send password back to client
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Admin-only middleware
  app.use("/api/admin/*", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  });
  
  // Google OAuth routes
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { 
      failureRedirect: "/auth?error=google-auth-failed"
    }),
    (req, res) => {
      res.redirect("/");
    }
  );
  
  // GitHub OAuth routes
  app.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
  
  app.get(
    "/api/auth/github/callback",
    passport.authenticate("github", { 
      failureRedirect: "/auth?error=github-auth-failed"
    }),
    (req, res) => {
      res.redirect("/");
    }
  );
}
