import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, X } from "lucide-react";
import type { Listing } from "@shared/schema";

interface ListingModalProps {
  listing: (Listing & { id: string }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ListingModal = ({ listing, open, onOpenChange }: ListingModalProps) => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  if (!listing) return null;

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric",
      year: "numeric" 
    });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would use EmailJS or Firebase Functions
    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message sent!",
        description: "The host will get back to you soon.",
      });
      
      setContactForm({ name: "", email: "", message: "" });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {listing.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative">
              {listing.images.length > 0 ? (
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-80 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No images available</span>
                </div>
              )}
              
              {listing.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              )}
            </div>
            
            {listing.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {listing.images.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${listing.title} ${index + 1}`}
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {formatPrice(listing.price)}/month
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <span>🛏️ {listing.bedrooms} Bedrooms</span>
                    <span className="mx-3">·</span>
                    <span>🛁 {listing.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{listing.address}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {listing.distanceToND} miles from Notre Dame campus
                  </div>
                </div>
                <Badge 
                  variant={listing.isAvailable ? "default" : "secondary"}
                  className={listing.isAvailable ? "bg-green-100 text-green-800" : ""}
                >
                  {listing.isAvailable ? "Available" : "No longer available"}
                </Badge>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 mb-2">Available Dates</h4>
                <p className="text-green-700">
                  {formatDate(listing.availableFrom)} - {formatDate(listing.availableTo)}
                </p>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary">
                    {getAmenityEmoji(amenity)} {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
              <p className="text-gray-600 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Contact Host</h4>
              
              <div className="mb-4 space-y-2">
                <div className="flex items-center text-gray-700">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{listing.contactEmail}</span>
                </div>
                {listing.contactPhone && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{listing.contactPhone}</span>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="contact-name">Your Name</Label>
                  <Input
                    id="contact-name"
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    required
                    className="focus:ring-nd-blue focus:border-nd-blue"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@nd.edu"
                    required
                    className="focus:ring-nd-blue focus:border-nd-blue"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Hi! I'm interested in your listing..."
                    rows={4}
                    className="focus:ring-nd-blue focus:border-nd-blue"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-nd-blue text-white hover:bg-nd-blue-light"
                >
                  Send Message
                </Button>
              </form>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Only ND students can post listings. Always meet in safe, public places.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
