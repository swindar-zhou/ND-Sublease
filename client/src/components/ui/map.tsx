
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Property } from '@/types/Property';

interface MapProps {
  properties: Property[];
  onPropertySelect: (property: Property | null) => void;
}

const Map = ({ properties, onPropertySelect }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Your Google Maps API key
  const apiKey = 'AIzaSyCFpRyR3Snv5eQzvoNmFEhTqIlev58ahc0';

  // Initialize Google Maps
  useEffect(() => {
    if (!apiKey || !mapContainer.current) return;

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (!mapContainer.current) return;

      // Notre Dame coordinates
      const notreDameCenter = { lat: 41.7001, lng: -86.2379 };

      map.current = new google.maps.Map(mapContainer.current, {
        zoom: 15,
        center: notreDameCenter,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi.school',
            elementType: 'geometry.fill',
            stylers: [{ color: '#0c2340' }] // Notre Dame blue
          }
        ]
      });

      setMapLoaded(true);
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
    });
  }, [apiKey]);

  // Add property markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Add new markers
    properties.forEach((property) => {
      const marker = new google.maps.Marker({
        position: property.coordinates,
        map: map.current,
        title: property.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#0c2340', // Notre Dame blue
          fillOpacity: 1,
          strokeColor: '#ffc72c', // Notre Dame gold
          strokeWeight: 3,
        }
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-bold text-sm text-gray-900 mb-1">${property.title}</h3>
            <p class="text-lg font-bold text-blue-900 mb-1">$${property.price}/month</p>
            <p class="text-sm text-gray-600 mb-2">${property.bedrooms}BR • ${property.bathrooms}BA</p>
            <p class="text-xs text-gray-500 mb-2">${property.distance}</p>
            <button 
              onclick="window.selectProperty(${property.id})" 
              class="bg-blue-900 text-white px-3 py-1 rounded text-xs hover:bg-blue-800"
            >
              View Details
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker);
      });

      markers.current.push(marker);
    });

    // Global function to select property from info window
    (window as any).selectProperty = (propertyId: number) => {
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        onPropertySelect(property);
      }
    };
  }, [properties, mapLoaded, onPropertySelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
