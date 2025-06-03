import { storage } from "./storage";
import type { InsertListing } from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database with sample listings...");
  
  const sampleListings: InsertListing[] = [
    {
      userId: 1,
      title: "Luxury Downtown Penthouse with Campus Views",
      description: "Exclusive penthouse apartment with panoramic views of Notre Dame campus. Premium location with top-tier amenities and concierge services.",
      price: "10000",
      bedrooms: 3,
      bathrooms: 2.5,
      address: "123 Notre Dame Avenue, South Bend, IN 46556",
      latitude: 41.7021,
      longitude: -86.2367,
      distanceToND: 0.5,
      furnished: true,
      availableFrom: "2025-01-15",
      availableTo: "2025-05-15",
      amenities: ["WiFi", "Parking", "AC", "Laundry", "Dishwasher", "Gym"],
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center"
      ],
      contactEmail: "student1@nd.edu",
      contactPhone: "(574) 123-4567",
      isAvailable: true
    },
    {
      userId: 1,
      title: "Executive Mansion Near Historic Campus",
      description: "Sophisticated mansion-style residence perfect for distinguished students. Features elegant interiors and prestigious address close to university grounds.",
      price: "10000",
      bedrooms: 4,
      bathrooms: 3,
      address: "456 Edison Road, South Bend, IN 46637",
      latitude: 41.6890,
      longitude: -86.2420,
      distanceToND: 1.2,
      furnished: true,
      availableFrom: "2025-02-01",
      availableTo: "2025-08-31",
      amenities: ["WiFi", "AC", "Parking", "Laundry", "Pool", "Security"],
      images: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&crop=center"
      ],
      contactEmail: "student2@nd.edu",
      contactPhone: "(574) 987-6543",
      isAvailable: true
    }
  ];

  try {
    for (const listing of sampleListings) {
      await storage.createListing(listing);
    }
    console.log(`Database seeded successfully with ${sampleListings.length} listings`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}