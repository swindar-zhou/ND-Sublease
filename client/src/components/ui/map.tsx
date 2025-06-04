import { useEffect, useRef, useState } from "react";
import { NOTRE_DAME_COORDS } from "@shared/schema";
import type { Listing } from "@shared/schema";

interface MapProps {
  listings: (Listing & { id: number })[];
  onMarkerClick?: (listing: Listing & { id: number }) => void;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export const Map = ({ listings, onMarkerClick, className = "" }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoogleMaps = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        reject(new Error("Google Maps API key not found"));
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps"));
      
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMaps();
        
        if (!mapRef.current) {
          setError("Map container not found");
          return;
        }

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: NOTRE_DAME_COORDS.lat, lng: NOTRE_DAME_COORDS.lng },
          zoom: 13,
          mapTypeId: "roadmap",
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        mapInstance.current = map;
        setIsLoaded(true);
      } catch (err) {
        console.error("Map initialization failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load map");
      }
    };

    // Delay to ensure DOM is ready
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, []);

  // Add markers when map is loaded
  useEffect(() => {
    if (!isLoaded || !mapInstance.current || !listings.length) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Add new markers
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
  }, [isLoaded, listings, onMarkerClick]);

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
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