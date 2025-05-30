import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart } from "lucide-react";
import type { Listing } from "@shared/schema";

interface ListingCardProps {
  listing: Listing & { id: string };
  onCardClick: (listing: Listing & { id: string }) => void;
  onSave?: (listingId: string) => void;
  saved?: boolean;
}

export const ListingCard = ({ listing, onCardClick, onSave, saved = false }: ListingCardProps) => {
  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toLocaleString()}/mo`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(listing.id);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onCardClick(listing)}
    >
      <div className="relative">
        {listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
          {formatPrice(listing.price)}
        </div>
        <div className="absolute top-3 left-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          Available Now
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
          <div className="flex items-center text-yellow-400">
            <span className="text-sm">⭐</span>
            <span className="text-sm text-gray-600 ml-1">4.8</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">
            {listing.address} · {listing.distanceToND} miles from campus
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <span>🛏️ {listing.bedrooms}BR</span>
          <span>🛁 {listing.bathrooms}BA</span>
          <span>
            {formatDate(listing.availableFrom)}–{formatDate(listing.availableTo)}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {listing.amenities.slice(0, 4).map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs">
              {getAmenityEmoji(amenity)} {amenity}
            </Badge>
          ))}
          {listing.amenities.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{listing.amenities.length - 4} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Posted {new Date(listing.createdAt).toLocaleDateString()}
          </span>
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveClick}
              className="text-nd-blue hover:text-nd-blue-light"
            >
              <Heart className={`h-4 w-4 mr-1 ${saved ? "fill-current" : ""}`} />
              Save
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const getAmenityEmoji = (amenity: string): string => {
  const emojiMap: Record<string, string> = {
    WiFi: "🛜",
    Parking: "🚗",
    AC: "❄️",
    Laundry: "🧺",
    Dishwasher: "🍽️",
    Pool: "🏊",
    Gym: "🏋️",
    "Study Room": "📚",
    Balcony: "🏡",
    Yard: "🌿",
  };
  return emojiMap[amenity] || "🏠";
};
