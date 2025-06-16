import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, MessageCircle } from "lucide-react";
import type { Listing } from "@shared/schema";

interface ListingCardProps {
  listing: Listing & { id: string };
  onCardClick: (listing: Listing & { id: string }) => void;
  onSave?: (listingId: string) => void;
  onMessage?: (listing: Listing & { id: string }) => void;
  saved?: boolean;
  isOwnListing?: boolean;
}

export const ListingCard = ({ listing, onCardClick, onSave, saved = false, isOwnListing = false }: ListingCardProps) => {
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

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage?.(listing);
  };

  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
        isOwnListing ? "ring-2 ring-blue-500 bg-blue-50" : ""
      }`}
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
        {isOwnListing ? (
          <div className="absolute top-3 left-3 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            Your Listing
          </div>
        ) : (
          <div className="absolute top-3 left-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Available Now
          </div>
        )}
        {onSave && (
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveClick}
              className="bg-white/80 hover:bg-white p-1 h-8 w-8 rounded-full"
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
          <span className="text-xl font-bold text-gray-900">{formatPrice(listing.price)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">
            {listing.address} · {listing.distanceToND} miles from campus
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
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {!isOwnListing && onMessage && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMessageClick}
                className="h-8 px-3 text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Contact
              </Button>
            )}
            
            {onSave && !isOwnListing && (
              <Button
                size="sm"
                variant={saved ? "default" : "outline"}
                onClick={handleSaveClick}
                className="h-8 px-3"
              >
                <Heart className={`h-3 w-3 ${saved ? "fill-current" : ""}`} />
              </Button>
            )}
          </div>
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
