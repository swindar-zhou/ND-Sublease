import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, listings, type User, type InsertUser, type Listing, type InsertListing } from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Listing methods
  getListings(filters?: {
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    distanceMax?: number;
    furnished?: boolean;
    amenities?: string[];
  }): Promise<(Listing & { id: number })[]>;
  getListing(id: number): Promise<(Listing & { id: number }) | undefined>;
  createListing(listing: InsertListing): Promise<Listing & { id: number }>;
  updateListing(id: number, updates: Partial<InsertListing>): Promise<void>;
  deleteListing(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Listing methods
  async getListings(filters?: {
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    distanceMax?: number;
    furnished?: boolean;
    amenities?: string[];
  }): Promise<(Listing & { id: number })[]> {
    let query = db.select().from(listings).where(eq(listings.isAvailable, true));
    
    if (filters) {
      const conditions = [eq(listings.isAvailable, true)];
      
      if (filters.bedrooms) {
        conditions.push(gte(listings.bedrooms, filters.bedrooms));
      }
      
      if (filters.bathrooms) {
        conditions.push(gte(listings.bathrooms, filters.bathrooms.toString()));
      }
      
      if (filters.furnished !== undefined) {
        conditions.push(eq(listings.furnished, filters.furnished));
      }
      
      if (filters.distanceMax) {
        conditions.push(lte(listings.distanceToND, filters.distanceMax.toString()));
      }
      
      query = db.select().from(listings).where(and(...conditions));
    }
    
    const result = await query.orderBy(desc(listings.createdAt));
    
    // Apply client-side filters for complex conditions
    let filteredResults = result;
    
    if (filters?.priceMin || filters?.priceMax) {
      filteredResults = filteredResults.filter(listing => {
        const price = parseFloat(listing.price);
        if (filters.priceMin && price < filters.priceMin) return false;
        if (filters.priceMax && price > filters.priceMax) return false;
        return true;
      });
    }
    
    if (filters?.amenities && filters.amenities.length > 0) {
      filteredResults = filteredResults.filter(listing => 
        filters.amenities!.every(amenity => listing.amenities.includes(amenity))
      );
    }
    
    return filteredResults.map(listing => ({ ...listing, id: listing.id }));
  }

  async getListing(id: number): Promise<(Listing & { id: number }) | undefined> {
    const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    if (result[0]) {
      return { ...result[0], id: result[0].id };
    }
    return undefined;
  }

  async createListing(insertListing: InsertListing): Promise<Listing & { id: number }> {
    const result = await db.insert(listings).values(insertListing).returning();
    return { ...result[0], id: result[0].id };
  }

  async updateListing(id: number, updates: Partial<InsertListing>): Promise<void> {
    await db.update(listings).set({ ...updates, updatedAt: new Date() }).where(eq(listings.id, id));
  }

  async deleteListing(id: number): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id));
  }
}

export const storage = new DatabaseStorage();
