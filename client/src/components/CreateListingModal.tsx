import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
// Removed Google Maps dependencies
import { insertListingSchema, AMENITIES } from "@shared/schema";
import type { InsertListing } from "@shared/schema";
import { Upload, X } from "lucide-react";

interface CreateListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateListingModal = ({ open, onOpenChange }: CreateListingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    bedrooms: 1,
    bathrooms: 1,
    address: "",
    furnished: false,
    availableFrom: "",
    availableTo: "",
    amenities: [] as string[],
    contactEmail: user?.email || "",
    contactPhone: "",
  });

  const updateField = <K extends keyof typeof formData>(
    field: K, 
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 8)); // Limit to 8 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Use default coordinates for Notre Dame area
      const defaultLat = "41.7020";
      const defaultLng = "-86.2379";
      const defaultDistance = "1.0";

      // Prepare listing data
      const listingData: InsertListing = {
        ...formData,
        latitude: defaultLat,
        longitude: defaultLng,
        distanceToND: defaultDistance,
        images: [], // No image upload for now
        isAvailable: true,
      };

      // Create the listing via API
      const response = await apiRequest("/api/listings", {
        method: "POST",
        body: JSON.stringify(listingData),
      });

      // Refresh the listings cache
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });

      toast({
        title: "Listing created!",
        description: "Your sublease listing has been posted successfully.",
      });

      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        price: "",
        bedrooms: 1,
        bathrooms: 1,
        address: "",
        furnished: false,
        availableFrom: "",
        availableTo: "",
        amenities: [],
        contactEmail: user?.email || "",
        contactPhone: "",
      });
      setImages([]);
      onOpenChange(false);

    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Sublease</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Listing Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g., Cozy 2BR Near Campus"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe your property, amenities, and what makes it special..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price per Month ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="1200"
                  required
                />
              </div>
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.bedrooms}
                  onChange={(e) => updateField("bedrooms", parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={(e) => updateField("bathrooms", parseFloat(e.target.value))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="123 Main St, South Bend, IN 46556"
                required
              />
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Availability</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="available-from">Available From</Label>
                <Input
                  id="available-from"
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => updateField("availableFrom", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="available-to">Available To</Label>
                <Input
                  id="available-to"
                  type="date"
                  value={formData.availableTo}
                  onChange={(e) => updateField("availableTo", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Furnished */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="furnished"
              checked={formData.furnished}
              onCheckedChange={(checked) => updateField("furnished", !!checked)}
            />
            <Label htmlFor="furnished">Property is furnished</Label>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              {AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                    {getAmenityEmoji(amenity)} {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Photos</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="images" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload photos of your property
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      At least 1 photo required (max 8)
                    </span>
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-phone">Phone (optional)</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                  placeholder="(574) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || images.length === 0}
              className="bg-nd-blue text-white hover:bg-nd-blue-light"
            >
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
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
