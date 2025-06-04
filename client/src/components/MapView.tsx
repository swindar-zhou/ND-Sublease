import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/maps";
import { NOTRE_DAME_COORDS } from "@shared/schema";
import type { Listing } from "@shared/schema";

interface MapViewProps {
  listings: (Listing & { id: string })[];
  onMarkerClick?: (listing: Listing & { id: string }) => void;
  className?: string;
}

export const MapView = ({ listings, onMarkerClick, className = "" }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        console.log("Starting Google Maps initialization...");
        console.log("API Key exists:", !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
        
        await loadGoogleMaps();
        console.log("Google Maps API loaded successfully");
        
        if (!mapRef.current) {
          console.error("Map container ref is null");
          return;
        }

        console.log("Creating map instance...");
        const map = new window.google.maps.Map(mapRef.current, {
          center: NOTRE_DAME_COORDS,
          zoom: 13,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        mapInstance.current = map;
        console.log("Map created successfully");
        setMapLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        setMapError(`Failed to load map: ${error.message}`);
      }
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapInstance.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Add markers for listings
    listings.forEach(listing => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(listing.latitude),
          lng: parseFloat(listing.longitude)
        },
        map: mapInstance.current,
        title: listing.title,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#0C2340" stroke="white" stroke-width="2"/>
              <text x="20" y="14" text-anchor="middle" fill="white" font-size="8" font-weight="bold">$</text>
              <text x="20" y="24" text-anchor="middle" fill="white" font-size="6" font-weight="bold">${Math.round(parseFloat(listing.price) / 100)}k</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }
      });

      marker.addListener('click', () => {
        onMarkerClick?.(listing);
      });

      markers.current.push(marker);
    });
  }, [listings, mapLoaded, onMarkerClick]);

  if (mapError) {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
          <p className="text-gray-600">{mapError}</p>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nd-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
};
