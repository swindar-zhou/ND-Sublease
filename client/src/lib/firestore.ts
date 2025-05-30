import { db } from "./firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Query,
  DocumentData
} from "firebase/firestore";
import type { Listing, InsertListing, ListingFilters } from "@shared/schema";

const LISTINGS_COLLECTION = "listings";
const USERS_COLLECTION = "users";

export const createListing = async (listing: InsertListing, userId: string) => {
  const listingData = {
    ...listing,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const docRef = await addDoc(collection(db, LISTINGS_COLLECTION), listingData);
  return docRef.id;
};

export const updateListing = async (listingId: string, updates: Partial<InsertListing>) => {
  const listingRef = doc(db, LISTINGS_COLLECTION, listingId);
  await updateDoc(listingRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteListing = async (listingId: string) => {
  const listingRef = doc(db, LISTINGS_COLLECTION, listingId);
  await deleteDoc(listingRef);
};

export const markListingUnavailable = async (listingId: string) => {
  const listingRef = doc(db, LISTINGS_COLLECTION, listingId);
  await updateDoc(listingRef, {
    isAvailable: false,
    updatedAt: new Date().toISOString(),
  });
};

export const getListings = async (filters?: ListingFilters) => {
  let q: Query<DocumentData> = collection(db, LISTINGS_COLLECTION);

  // Only show available listings
  q = query(q, where("isAvailable", "==", true));

  // Apply filters
  if (filters?.bedrooms) {
    q = query(q, where("bedrooms", ">=", filters.bedrooms));
  }
  
  if (filters?.bathrooms) {
    q = query(q, where("bathrooms", ">=", filters.bathrooms));
  }
  
  if (filters?.furnished !== undefined) {
    q = query(q, where("furnished", "==", filters.furnished));
  }
  
  if (filters?.distanceMax) {
    q = query(q, where("distanceToND", "<=", filters.distanceMax));
  }

  // Order by creation date (newest first)
  q = query(q, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  const listings = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as (Listing & { id: string })[];

  // Apply client-side filters for complex conditions
  let filteredListings = listings;

  if (filters?.priceMin || filters?.priceMax) {
    filteredListings = filteredListings.filter(listing => {
      const price = parseFloat(listing.price);
      if (filters.priceMin && price < filters.priceMin) return false;
      if (filters.priceMax && price > filters.priceMax) return false;
      return true;
    });
  }

  if (filters?.amenities && filters.amenities.length > 0) {
    filteredListings = filteredListings.filter(listing => 
      filters.amenities!.every(amenity => listing.amenities.includes(amenity))
    );
  }

  return filteredListings;
};

export const getListing = async (listingId: string) => {
  const listingRef = doc(db, LISTINGS_COLLECTION, listingId);
  const snapshot = await getDoc(listingRef);
  
  if (!snapshot.exists()) {
    throw new Error("Listing not found");
  }
  
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Listing & { id: string };
};

export const getUserListings = async (userId: string) => {
  const q = query(
    collection(db, LISTINGS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as (Listing & { id: string })[];
};

export const createUser = async (userData: { uid: string; email: string; name: string }) => {
  const userDoc = {
    ...userData,
    createdAt: new Date().toISOString(),
  };
  
  const docRef = await addDoc(collection(db, USERS_COLLECTION), userDoc);
  return docRef.id;
};
