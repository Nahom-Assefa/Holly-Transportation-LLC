/**
 * Local Development Authentication System
 * 
 * @description Simple username/password authentication for local development.
 * Provides complete authentication functionality without external dependencies.
 * Only active when NODE_ENV is 'development'.
 */
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import session from "express-session";
import { Express } from "express";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const scryptAsync = promisify(scrypt);

/**
 * Hash password securely for storage
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compare provided password with stored hash
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Local authentication schemas
 */
const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  phone: z.string().optional(),
});

/**
 * Setup local development authentication
 */
export function setupLocalAuth(app: Express) {
  // Session configuration for local development
  app.use(session({
    secret: process.env.SESSION_SECRET || 'local-dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // HTTP for local development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const userId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const userData = {
        id: userId,
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
        profileImageUrl: null,
        medicalNotes: null,
        isAdmin: false,
      };

      const newUser = await storage.createLocalUser(userData);
      
      // Set up session
      (req.session as any).userId = newUser.id;
      (req.session as any).user = newUser;

      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        isAdmin: newUser.isAdmin,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set up session
      (req.session as any).userId = user.id;
      (req.session as any).user = user;

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req, res) => {
    const session = req.session as any;
    if (!session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Create default admin user for development
  createDefaultUsers();
}

/**
 * Create default users for local development testing
 */
async function createDefaultUsers() {
  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    if (existingAdmin) return;

    // Create admin user
    const adminPassword = await hashPassword("admin123");
    const adminData = {
      id: "local-admin-001",
      username: "admin",
      email: "admin@hollytransportation.com",
      password: adminPassword,
      firstName: "Holly",
      lastName: "Admin",
      phone: "(651) 500-6198",
      profileImageUrl: null,
      medicalNotes: null,
      isAdmin: true,
    };

    await storage.createLocalUser(adminData);

    // Create test user
    const userPassword = await hashPassword("test123");
    const userData = {
      id: "local-user-001",
      username: "testuser",
      email: "test@example.com",
      password: userPassword,
      firstName: "Test",
      lastName: "User",
      phone: "(555) 123-4567",
      profileImageUrl: null,
      medicalNotes: "Uses wheelchair for mobility",
      isAdmin: false,
    };

    await storage.createLocalUser(userData);

    console.log("✅ Created default development users:");
    console.log("   Admin: username=admin, password=admin123");
    console.log("   User:  username=testuser, password=test123");
  } catch (error) {
    console.error("Error creating default users:", error);
  }
}

/**
 * Middleware to check if user is authenticated (local development)
 */
export function requireAuth(req: any, res: any, next: any) {
  const session = req.session as any;
  if (!session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = session.user;
  next();
}

/**
 * Middleware to check if user is admin (local development)
 */
export function requireAdmin(req: any, res: any, next: any) {
  const session = req.session as any;
  if (!session.userId || !session.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  req.user = session.user;
  next();
}