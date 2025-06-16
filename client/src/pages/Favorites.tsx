import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { ListingModal } from "@/components/ListingModal";
import { Button } from "@/components/ui/button";
import { Heart, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Listing } from "@shared/schema";

export const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedListing, setSelectedListing] = useState<(Listing & { id: number }) | null>(null);

  const { data: favorites = [], isLoading, refetch } = useQuery<(Listing & { id: number })[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user && isAuthenticated,
  });

  const handleRemoveFromFavorites = async (listingId: string) => {
    try {
      await apiRequest(`/api/favorites/${listingId}`, {
        method: "DELETE",
      });
      
      refetch();
      
      toast({
        title: "Listing removed",
        description: "This listing has been removed from your favorites.",
      });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      toast({
        title: "Error",
        description: "Failed to remove listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleListingClick = (listing: Listing & { id: number }) => {
    setSelectedListing(listing);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please sign in</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your favorites.</p>
          <Button onClick={() => window.location.href = "/"}>
            Go to Homepage
          </Button>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        </div>
      </>
    );
  }

  if (favorites.length === 0) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
          <p className="text-gray-600 mb-6">Browse listings and click the heart icon to save properties you're interested in.</p>
          <Button onClick={() => window.location.href = "/"}>
            Browse Listings
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">Properties you've saved for later</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={{
                ...listing,
                id: listing.id.toString()
              }}
              onCardClick={() => handleListingClick(listing)}
              onSave={handleRemoveFromFavorites}
              saved={true}
            />
          ))}
        </div>
      </div>

      {selectedListing && (
        <ListingModal
          listing={{
            ...selectedListing,
            id: selectedListing.id.toString()
          }}
          open={!!selectedListing}
          onOpenChange={(open) => !open && setSelectedListing(null)}
        />
      )}
    </>
  );
};