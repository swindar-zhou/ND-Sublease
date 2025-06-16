import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Calendar, MapPin, Users, Bath, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Listing } from "@shared/schema";

export const MyListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedListing, setSelectedListing] = useState<(Listing & { id: number }) | null>(null);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["/api/my-listings"],
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (listingId: number) => {
      await apiRequest(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Listing deleted",
        description: "Your listing has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ listingId, isAvailable }: { listingId: number; isAvailable: boolean }) => {
      await apiRequest(`/api/listings/${listingId}`, {
        method: "PUT",
        body: JSON.stringify({ isAvailable }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Listing updated",
        description: "Availability status has been updated.",
      });
    },
  });

  const handleDeleteListing = (listingId: number) => {
    if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      deleteMutation.mutate(listingId);
    }
  };

  const handleToggleAvailability = (listing: Listing & { id: number }) => {
    toggleAvailabilityMutation.mutate({
      listingId: listing.id,
      isAvailable: !listing.isAvailable,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No listings yet</h2>
        <p className="text-gray-600 mb-6">You haven't created any listings. Start by posting your first property!</p>
        <Button onClick={() => window.location.href = "/"}>
          Create Your First Listing
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
        <p className="text-gray-600">Manage your posted properties</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing: Listing & { id: number }) => (
          <Card key={listing.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <Badge
                className={`absolute top-2 right-2 ${
                  listing.isAvailable
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {listing.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{listing.title}</CardTitle>
              <div className="text-2xl font-bold text-blue-600">
                ${listing.price}/month
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {listing.bedrooms} bed
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {listing.bathrooms} bath
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {listing.distanceToND} miles from ND
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {listing.availableFrom} - {listing.availableTo}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedListing(listing)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleAvailability(listing)}
                  disabled={toggleAvailabilityMutation.isPending}
                >
                  {listing.isAvailable ? "Mark Unavailable" : "Mark Available"}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteListing(listing.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};