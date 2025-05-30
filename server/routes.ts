import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertListingSchema, listingFiltersSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for listings
  app.get("/api/listings", async (req, res) => {
    try {
      const filters = req.query;
      const validatedFilters = listingFiltersSchema.parse(filters);
      const listings = await storage.getListings(validatedFilters);
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

  app.post("/api/listings", async (req, res) => {
    try {
      const validatedData = insertListingSchema.parse(req.body);
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

  const httpServer = createServer(app);

  return httpServer;
}
