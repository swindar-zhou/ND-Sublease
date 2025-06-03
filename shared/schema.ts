import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }).notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  distanceToND: decimal("distance_to_nd", { precision: 5, scale: 2 }).notNull(), // miles
  furnished: boolean("furnished").default(false).notNull(),
  availableFrom: text("available_from").notNull(), // ISO date string
  availableTo: text("available_to").notNull(), // ISO date string
  amenities: jsonb("amenities").$type<string[]>().default([]).notNull(),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  user2Id: integer("user2_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: integer("listing_id").references(() => listings.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
  bedrooms: z.number().min(0).max(10),
  bathrooms: z.number().min(0.5).max(10),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  distanceToND: z.number().min(0).max(50),
  availableFrom: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  availableTo: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1, "At least one image is required"),
  contactEmail: z.string().email().refine((email) => email.endsWith("@nd.edu"), "Must be a Notre Dame email"),
  contactPhone: z.string().optional(),
});

export const listingFiltersSchema = z.object({
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  distanceMax: z.number().optional(),
  furnished: z.boolean().optional(),
  amenities: z.array(z.string()).default([]),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type ListingFilters = z.infer<typeof listingFiltersSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const AMENITIES = [
  "WiFi",
  "Parking",
  "AC",
  "Laundry",
  "Dishwasher",
  "Pool",
  "Gym",
  "Study Room",
  "Balcony",
  "Yard",
] as const;

export const NOTRE_DAME_COORDS = {
  lat: 41.7001,
  lng: -86.2379,
} as const;
