import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, listings, favorites, conversations, messages, type User, type InsertUser, type Listing, type InsertListing, type Favorite, type InsertFavorite, type Conversation, type InsertConversation, type Message, type InsertMessage } from "@shared/schema";
import { eq, desc, and, gte, lte, or } from "drizzle-orm";

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
  getUserListings(userId: number): Promise<(Listing & { id: number })[]>;
  
  // Favorites methods
  addFavorite(userId: number, listingId: number): Promise<void>;
  removeFavorite(userId: number, listingId: number): Promise<void>;
  getUserFavorites(userId: number): Promise<(Listing & { id: number })[]>;
  isFavorited(userId: number, listingId: number): Promise<boolean>;
  
  // Messaging methods
  createConversation(user1Id: number, user2Id: number, listingId?: number): Promise<Conversation & { id: number }>;
  getConversation(user1Id: number, user2Id: number, listingId?: number): Promise<(Conversation & { id: number }) | undefined>;
  getUserConversations(userId: number): Promise<(Conversation & { id: number; otherUser: User; listing?: Listing; lastMessage?: Message })[]>;
  sendMessage(conversationId: number, senderId: number, content: string): Promise<Message & { id: number }>;
  getMessages(conversationId: number, userId: number): Promise<(Message & { id: number; sender: User })[]>;
  markMessageAsRead(messageId: number, userId: number): Promise<void>;
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
      
      if (filters.priceMin) {
        conditions.push(gte(listings.price, filters.priceMin.toString()));
      }
      
      if (filters.priceMax) {
        conditions.push(lte(listings.price, filters.priceMax.toString()));
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

  // Favorites methods
  async addFavorite(userId: number, listingId: number): Promise<void> {
    await db.insert(favorites).values({ userId, listingId });
  }

  async removeFavorite(userId: number, listingId: number): Promise<void> {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.listingId, listingId))
    );
  }

  async getUserFavorites(userId: number): Promise<(Listing & { id: number })[]> {
    const result = await db
      .select()
      .from(listings)
      .innerJoin(favorites, eq(listings.id, favorites.listingId))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
    
    return result.map(row => ({ ...row.listings, id: row.listings.id }));
  }

  async isFavorited(userId: number, listingId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)))
      .limit(1);
    
    return result.length > 0;
  }

  // Messaging methods
  async createConversation(user1Id: number, user2Id: number, listingId?: number): Promise<Conversation & { id: number }> {
    const insertData: InsertConversation = {
      user1Id: Math.min(user1Id, user2Id), // Always put smaller ID first for consistency
      user2Id: Math.max(user1Id, user2Id),
      listingId: listingId || null,
    };

    const result = await db.insert(conversations).values(insertData).returning();
    return { ...result[0], id: result[0].id };
  }

  async getConversation(user1Id: number, user2Id: number, listingId?: number): Promise<(Conversation & { id: number }) | undefined> {
    const minId = Math.min(user1Id, user2Id);
    const maxId = Math.max(user1Id, user2Id);
    
    let whereConditions = and(eq(conversations.user1Id, minId), eq(conversations.user2Id, maxId));

    if (listingId) {
      whereConditions = and(whereConditions, eq(conversations.listingId, listingId));
    }

    const result = await db
      .select()
      .from(conversations)
      .where(whereConditions)
      .limit(1);
      
    return result[0] ? { ...result[0], id: result[0].id } : undefined;
  }

  async getUserConversations(userId: number): Promise<(Conversation & { id: number; otherUser: User; listing?: Listing; lastMessage?: Message })[]> {
    const result = await db
      .select({
        conversation: conversations,
        otherUser: users,
        listing: listings,
        lastMessage: messages,
      })
      .from(conversations)
      .leftJoin(users, 
        or(
          and(eq(conversations.user1Id, userId), eq(users.id, conversations.user2Id)),
          and(eq(conversations.user2Id, userId), eq(users.id, conversations.user1Id))
        )
      )
      .leftJoin(listings, eq(conversations.listingId, listings.id))
      .leftJoin(messages, eq(messages.conversationId, conversations.id))
      .where(or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId)))
      .orderBy(desc(conversations.updatedAt));

    const conversationsMap = new Map();
    
    for (const row of result) {
      const conv = row.conversation;
      if (!conversationsMap.has(conv.id)) {
        conversationsMap.set(conv.id, {
          ...conv,
          id: conv.id,
          otherUser: row.otherUser!,
          listing: row.listing || undefined,
          lastMessage: row.lastMessage || undefined,
        });
      } else if (row.lastMessage && 
                 (!conversationsMap.get(conv.id).lastMessage || 
                  row.lastMessage.createdAt > conversationsMap.get(conv.id).lastMessage.createdAt)) {
        conversationsMap.get(conv.id).lastMessage = row.lastMessage;
      }
    }

    return Array.from(conversationsMap.values());
  }

  async sendMessage(conversationId: number, senderId: number, content: string): Promise<Message & { id: number }> {
    const insertData: InsertMessage = {
      conversationId,
      senderId,
      content,
    };

    const result = await db.insert(messages).values(insertData).returning();
    
    // Update conversation timestamp
    await db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return { ...result[0], id: result[0].id };
  }

  async getMessages(conversationId: number, userId: number): Promise<(Message & { id: number; sender: User })[]> {
    const result = await db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    return result.map(row => ({
      ...row.message,
      id: row.message.id,
      sender: row.sender,
    }));
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<void> {
    await db.update(messages)
      .set({ readAt: new Date() })
      .where(and(eq(messages.id, messageId), eq(messages.senderId, userId)));
  }
}

export const storage = new DatabaseStorage();
