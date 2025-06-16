import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertListingSchema, listingFiltersSchema, insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      // Validate @nd.edu email
      if (!email.endsWith("@nd.edu")) {
        return res.status(400).json({ error: "Only Notre Dame email addresses are allowed" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        uid: `nd_${Date.now()}`,
        email,
        name,
        passwordHash: hashedPassword
      });
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: "7d" });
      
      res.status(201).json({ user, token });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate @nd.edu email
      if (!email.endsWith("@nd.edu")) {
        return res.status(400).json({ error: "Only Notre Dame email addresses are allowed" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({ user, token });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Failed to sign in" });
    }
  });

  // API routes for listings
  app.get("/api/listings", async (req, res) => {
    try {
      const filters: any = {};
      
      // Convert query parameters to appropriate types
      if (req.query.priceMin) filters.priceMin = parseInt(req.query.priceMin as string);
      if (req.query.priceMax) filters.priceMax = parseInt(req.query.priceMax as string);
      if (req.query.bedrooms) filters.bedrooms = parseInt(req.query.bedrooms as string);
      if (req.query.bathrooms) filters.bathrooms = parseFloat(req.query.bathrooms as string);
      if (req.query.distanceMax) filters.distanceMax = parseFloat(req.query.distanceMax as string);
      if (req.query.furnished !== undefined) filters.furnished = req.query.furnished === 'true';
      if (req.query.amenities) {
        const amenitiesParam = req.query.amenities as string;
        filters.amenities = Array.isArray(amenitiesParam) ? amenitiesParam : amenitiesParam.split(',');
      }

      const listings = await storage.getListings(filters);
      res.json(listings);
    } catch (error) {
      console.error(`Error fetching listings: ${error}`);
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error(`Error fetching listing: ${error}`);
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  // Authentication middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.sendStatus(403);
      }
      console.log('Decoded JWT:', decoded);
      req.user = { userId: decoded.userId };
      next();
    });
  };

  app.post("/api/listings", authenticateToken, async (req: any, res) => {
    try {
      console.log("User from JWT:", req.user);
      console.log("Request body:", req.body);
      
      const validatedData = insertListingSchema.parse({
        ...req.body,
        userId: req.user.userId
      });
      
      console.log("Validated data:", validatedData);
      const listing = await storage.createListing(validatedData);
      res.status(201).json(listing);
    } catch (error) {
      console.error(`Error creating listing: ${error}`);
      res.status(500).json({ error: "Failed to create listing" });
    }
  });

  app.put("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      await storage.updateListing(id, updates);
      res.json({ success: true });
    } catch (error) {
      console.error(`Error updating listing: ${error}`);
      res.status(500).json({ error: "Failed to update listing" });
    }
  });

  app.delete("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteListing(id);
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting listing: ${error}`);
      res.status(500).json({ error: "Failed to delete listing" });
    }
  });

  // Favorites routes
  app.post("/api/favorites", authenticateToken, async (req: any, res) => {
    try {
      const { listingId } = req.body;
      await storage.addFavorite(req.user.userId, parseInt(listingId));
      res.status(201).json({ message: "Listing added to favorites" });
    } catch (error) {
      console.error(`Error adding favorite: ${error}`);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:listingId", authenticateToken, async (req: any, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      await storage.removeFavorite(req.user.userId, listingId);
      res.status(204).send();
    } catch (error) {
      console.error(`Error removing favorite: ${error}`);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  app.get("/api/favorites", authenticateToken, async (req: any, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.user.userId);
      res.json(favorites);
    } catch (error) {
      console.error(`Error fetching favorites: ${error}`);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.get("/api/favorites/:listingId/check", authenticateToken, async (req: any, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      const isFavorited = await storage.isFavorited(req.user.userId, listingId);
      res.json({ isFavorited });
    } catch (error) {
      console.error(`Error checking favorite: ${error}`);
      res.status(500).json({ error: "Failed to check favorite" });
    }
  });

  // Messaging routes
  app.get("/api/conversations", authenticateToken, async (req: any, res) => {
    try {
      const conversations = await storage.getUserConversations(req.user.userId);
      res.json(conversations);
    } catch (error) {
      console.error(`Error fetching conversations: ${error}`);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", authenticateToken, async (req: any, res) => {
    try {
      const { otherUserId, listingId } = req.body;
      
      // Check if conversation already exists
      let conversation = await storage.getConversation(req.user.userId, otherUserId, listingId);
      
      if (!conversation) {
        conversation = await storage.createConversation(req.user.userId, otherUserId, listingId);
      }
      
      res.json(conversation);
    } catch (error) {
      console.error(`Error creating conversation: ${error}`);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", authenticateToken, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getMessages(conversationId, req.user.userId);
      res.json(messages);
    } catch (error) {
      console.error(`Error fetching messages: ${error}`);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", authenticateToken, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;
      
      const message = await storage.sendMessage(conversationId, req.user.userId, content);
      res.status(201).json(message);
    } catch (error) {
      console.error(`Error sending message: ${error}`);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.patch("/api/messages/:id/read", authenticateToken, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.markMessageAsRead(messageId, req.user.userId);
      res.status(204).send();
    } catch (error) {
      console.error(`Error marking message as read: ${error}`);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
