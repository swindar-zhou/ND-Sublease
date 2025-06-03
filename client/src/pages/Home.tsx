import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ListingCard } from "@/components/ListingCard";
import { ListingModal } from "@/components/ListingModal";
import { MapView } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Plus, Grid, Map } from "lucide-react";
import type { Listing, ListingFilters } from "@shared/schema";

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<ListingFilters>({
    amenities: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedListing, setSelectedListing] = useState<(Listing & { id: number }) | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const { toast } = useToast();

  // Build query string from filters
  const buildQueryString = (filters: ListingFilters) => {
    const params = new URLSearchParams();
    
    if (filters.priceMin && filters.priceMin > 0) {
      params.append('priceMin', filters.priceMin.toString());
    }
    if (filters.priceMax && filters.priceMax > 0) {
      params.append('priceMax', filters.priceMax.toString());
    }
    if (filters.bedrooms && filters.bedrooms > 0) {
      params.append('bedrooms', filters.bedrooms.toString());
    }
    if (filters.bathrooms && filters.bathrooms > 0) {
      params.append('bathrooms', filters.bathrooms.toString());
    }
    if (filters.distanceMax && filters.distanceMax > 0) {
      params.append('distanceMax', filters.distanceMax.toString());
    }
    if (filters.furnished !== undefined) {
      params.append('furnished', filters.furnished.toString());
    }
    if (filters.amenities && filters.amenities.length > 0) {
      params.append('amenities', filters.amenities.join(','));
    }
    
    return params.toString() ? `?${params.toString()}` : '';
  };

  const queryString = buildQueryString(filters);
  const apiUrl = `/api/listings${queryString}`;

  const {
    data: listings = [],
    isLoading,
    error,
    refetch,
  } = useQuery<(Listing & { id: number })[]>({
    queryKey: [apiUrl],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch user's favorites if authenticated
  const { data: favorites } = useQuery<(Listing & { id: number })[]>({
    queryKey: ["/api/favorites"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  // Update saved listings when favorites data changes
  useEffect(() => {
    if (favorites && Array.isArray(favorites)) {
      const favoriteIds = new Set(favorites.map(listing => listing.id.toString()));
      setSavedListings(favoriteIds);
    }
  }, [favorites]);

  // Filter and sort listings
  const filteredListings = listings
    .filter(listing => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.address.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "distance":
          return parseFloat(a.distanceToND) - parseFloat(b.distanceToND);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleApplyFilters = () => {
    refetch();
  };

  const handleListingClick = (listing: Listing & { id: number }) => {
    setSelectedListing(listing);
  };

  const [savedListings, setSavedListings] = useState<Set<string>>(new Set());

  const handleSaveListing = async (listingId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save listings.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isSaved = savedListings.has(listingId);
      
      if (isSaved) {
        // Remove from favorites
        await apiRequest(`/api/favorites/${listingId}`, {
          method: "DELETE",
        });
        setSavedListings(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
        toast({
          title: "Listing removed",
          description: "This listing has been removed from your favorites.",
        });
      } else {
        // Add to favorites
        await apiRequest("/api/favorites", {
          method: "POST",
          body: JSON.stringify({ listingId }),
        });
        setSavedListings(prev => new Set(Array.from(prev).concat([listingId])));
        toast({
          title: "Listing saved!",
          description: "This listing has been added to your favorites.",
        });
      }
    } catch (error) {
      console.error("Error saving listing:", error);
      toast({
        title: "Error",
        description: "Failed to save listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Unable to load listings
            </h2>
            <p className="text-gray-600 mb-8">
              Please check your internet connection and try again.
            </p>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          
          {/* Filter Sidebar */}
          <aside className="lg:col-span-3 mb-6 lg:mb-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
            />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Search and Controls */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by location, address, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 focus:ring-nd-blue focus:border-nd-blue"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isLoading ? "Loading..." : `${filteredListings.length} subleases available`}
                  </h1>
                  <p className="text-gray-600">Near Notre Dame University</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Sort by: Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="distance">Distance to Campus</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex border border-gray-300 rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={viewMode === "grid" ? "bg-nd-blue text-white" : ""}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "map" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("map")}
                      className={viewMode === "map" ? "bg-nd-blue text-white" : ""}
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Map View (Desktop) */}
            {viewMode === "map" && (
              <div className="mb-6">
                <MapView
                  listings={filteredListings}
                  onMarkerClick={handleListingClick}
                  className="h-80"
                />
              </div>
            )}

            {/* Listings Grid */}
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="w-full h-48 bg-gray-200 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No listings found
                </h3>
                <p className="text-gray-600 mb-8">
                  Try adjusting your filters or search terms.
                </p>
                <Button
                  onClick={() => {
                    setFilters({ amenities: [] });
                    setSearchQuery("");
                  }}
                  variant="outline"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onCardClick={handleListingClick}
                    onSave={handleSaveListing}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {filteredListings.length > 0 && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  className="px-8"
                >
                  Load More Listings
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 bg-nd-blue text-white hover:bg-nd-blue-light shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Listing Detail Modal */}
      <ListingModal
        listing={selectedListing}
        open={!!selectedListing}
        onOpenChange={(open) => !open && setSelectedListing(null)}
      />
    </div>
  );
};
