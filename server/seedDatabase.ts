import { storage } from "./storage";
import type { InsertListing } from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database with sample listings...");
  
  const sampleListings: InsertListing[] = [
    {
      userId: 1,
      title: "Cozy 2BR Near Campus - Spring Sublease",
      description: "Beautiful 2-bedroom apartment just 0.5 miles from Notre Dame campus. Fully furnished with modern amenities. Perfect for students looking for a comfortable living space during spring semester.",
      price: "1200",
      bedrooms: 2,
      bathrooms: "1.5",
      address: "123 Notre Dame Avenue, South Bend, IN 46556",
      latitude: "41.7021",
      longitude: "-86.2367",
      distanceToND: "0.5",
      furnished: true,
      availableFrom: "2025-01-15",
      availableTo: "2025-05-15",
      amenities: ["WiFi", "Parking", "AC", "Laundry", "Dishwasher"],
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
      title: "Modern Studio Apartment - Downtown",
      description: "Stylish studio apartment in downtown South Bend. Recently renovated with high-end finishes. Great for graduate students or those who prefer city living.",
      price: "950",
      bedrooms: 1,
      bathrooms: "1",
      address: "456 Main Street, South Bend, IN 46601",
      latitude: "41.6764",
      longitude: "-86.2520",
      distanceToND: "2.1",
      furnished: false,
      availableFrom: "2025-02-01",
      availableTo: "2025-08-31",
      amenities: ["WiFi", "AC", "Gym", "Parking"],
      images: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&crop=center"
      ],
      contactEmail: "gradstudent@nd.edu",
      contactPhone: null,
      isAvailable: true
    },
    {
      userId: 1,
      title: "Spacious 3BR House with Yard - Eddy Street",
      description: "Large 3-bedroom house perfect for a group of students. Features include a big backyard for gatherings, full basement, and plenty of parking.",
      price: "1800",
      bedrooms: 3,
      bathrooms: "2",
      address: "789 Eddy Street, South Bend, IN 46617",
      latitude: "41.6998",
      longitude: "-86.2345",
      distanceToND: "0.8",
      furnished: true,
      availableFrom: "2025-03-01",
      availableTo: "2025-12-31",
      amenities: ["WiFi", "Parking", "Laundry", "Yard", "Dishwasher"],
      images: [
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop&crop=center"
      ],
      contactEmail: "housemates@nd.edu",
      contactPhone: "(574) 987-6543",
      isAvailable: true
    },
    {
      userId: 1,
      title: "Luxury 1BR Apartment - University Commons",
      description: "Premium 1-bedroom apartment in the heart of University Commons. Walking distance to campus with access to all Commons amenities.",
      price: "1400",
      bedrooms: 1,
      bathrooms: "1",
      address: "321 University Commons, South Bend, IN 46617",
      latitude: "41.7012",
      longitude: "-86.2340",
      distanceToND: "0.3",
      furnished: true,
      availableFrom: "2025-01-20",
      availableTo: "2025-07-31",
      amenities: ["WiFi", "AC", "Pool", "Gym", "Study Room", "Parking"],
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop&crop=center"
      ],
      contactEmail: "luxury.living@nd.edu",
      contactPhone: "(574) 555-0123",
      isAvailable: true
    },
    {
      userId: 1,
      title: "Affordable 2BR - Perfect for Roommates",
      description: "Budget-friendly 2-bedroom apartment ideal for students looking to share costs. Clean, safe, and well-maintained building with on-site management.",
      price: "800",
      bedrooms: 2,
      bathrooms: "1",
      address: "654 Corby Boulevard, South Bend, IN 46617",
      latitude: "41.7045",
      longitude: "-86.2398",
      distanceToND: "1.2",
      furnished: false,
      availableFrom: "2025-02-15",
      availableTo: "2025-08-15",
      amenities: ["WiFi", "Parking", "Laundry"],
      images: [
        "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&h=600&fit=crop&crop=center"
      ],
      contactEmail: "affordable.housing@nd.edu",
      contactPhone: "(574) 234-5678",
      isAvailable: true
    },
    {
      userId: 1,
      title: "Charming Duplex with Balcony - Quiet Neighborhood",
      description: "Lovely duplex unit in a quiet residential neighborhood. Features include a private balcony, updated kitchen, and peaceful setting perfect for studying.",
      price: "1100",
      bedrooms: 2,
      bathrooms: "1",
      address: "987 Napoleon Boulevard, South Bend, IN 46617",
      latitude: "41.7089",
      longitude: "-86.2421",
      distanceToND: "1.5",
      furnished: true,
      availableFrom: "2025-03-15",
      availableTo: "2025-09-30",
      amenities: ["WiFi", "AC", "Balcony", "Parking", "Dishwasher"],
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center"
      ],
      contactEmail: "quiet.living@nd.edu",
      contactPhone: null,
      isAvailable: true
    }
  ];

  try {
    for (const listing of sampleListings) {
      await storage.createListing(listing);
    }
    console.log("Database seeded successfully with", sampleListings.length, "listings");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}