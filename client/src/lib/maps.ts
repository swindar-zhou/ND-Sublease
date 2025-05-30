import { NOTRE_DAME_COORDS } from "@shared/schema";

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  price: string;
  title: string;
}

export const loadGoogleMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || "default_maps_key";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    
    document.head.appendChild(script);
  });
};

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateDistanceToND = (lat: number, lng: number): number => {
  return calculateDistance(lat, lng, NOTRE_DAME_COORDS.lat, NOTRE_DAME_COORDS.lng);
};

export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
  if (!window.google) {
    throw new Error("Google Maps not loaded");
  }

  const geocoder = new window.google.maps.Geocoder();
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results: any[], status: string) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        reject(new Error("Geocoding failed"));
      }
    });
  });
};
