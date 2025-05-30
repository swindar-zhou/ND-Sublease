import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { AMENITIES } from "@shared/schema";
import type { ListingFilters } from "@shared/schema";

interface FilterSidebarProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  onApplyFilters: () => void;
}

export const FilterSidebar = ({ filters, onFiltersChange, onApplyFilters }: FilterSidebarProps) => {
  const updateFilter = <K extends keyof ListingFilters>(key: K, value: ListingFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    updateFilter("amenities", updatedAmenities);
  };

  const clearFilters = () => {
    onFiltersChange({
      amenities: [],
    });
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-nd-blue hover:text-nd-blue-light"
          >
            Clear all
          </Button>
        </div>

        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Price Range
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceMin || ""}
                onChange={(e) => updateFilter("priceMin", e.target.value ? Number(e.target.value) : undefined)}
                className="focus:ring-nd-blue focus:border-nd-blue"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceMax || ""}
                onChange={(e) => updateFilter("priceMax", e.target.value ? Number(e.target.value) : undefined)}
                className="focus:ring-nd-blue focus:border-nd-blue"
              />
            </div>
          </div>

          {/* Distance to Campus */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Distance to Campus
            </Label>
            <Select
              value={filters.distanceMax?.toString() || ""}
              onValueChange={(value) => updateFilter("distanceMax", value === "any" ? undefined : Number(value))}
            >
              <SelectTrigger className="focus:ring-nd-blue focus:border-nd-blue">
                <SelectValue placeholder="Any distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any distance</SelectItem>
                <SelectItem value="0.5">Within 0.5 miles</SelectItem>
                <SelectItem value="1">Within 1 mile</SelectItem>
                <SelectItem value="2">Within 2 miles</SelectItem>
                <SelectItem value="5">Within 5 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                🛏️ Bedrooms
              </Label>
              <Select
                value={filters.bedrooms?.toString() || "any"}
                onValueChange={(value) => updateFilter("bedrooms", value === "any" ? undefined : Number(value))}
              >
                <SelectTrigger className="focus:ring-nd-blue focus:border-nd-blue">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                🛁 Bathrooms
              </Label>
              <Select
                value={filters.bathrooms?.toString() || "any"}
                onValueChange={(value) => updateFilter("bathrooms", value === "any" ? undefined : Number(value))}
              >
                <SelectTrigger className="focus:ring-nd-blue focus:border-nd-blue">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Furnished */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Furnished
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furnished-any"
                  checked={filters.furnished === undefined}
                  onCheckedChange={() => updateFilter("furnished", undefined)}
                  className="data-[state=checked]:bg-nd-blue data-[state=checked]:border-nd-blue"
                />
                <Label htmlFor="furnished-any" className="text-sm text-gray-700">
                  Any
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furnished-yes"
                  checked={filters.furnished === true}
                  onCheckedChange={() => updateFilter("furnished", true)}
                  className="data-[state=checked]:bg-nd-blue data-[state=checked]:border-nd-blue"
                />
                <Label htmlFor="furnished-yes" className="text-sm text-gray-700">
                  Furnished
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furnished-no"
                  checked={filters.furnished === false}
                  onCheckedChange={() => updateFilter("furnished", false)}
                  className="data-[state=checked]:bg-nd-blue data-[state=checked]:border-nd-blue"
                />
                <Label htmlFor="furnished-no" className="text-sm text-gray-700">
                  Unfurnished
                </Label>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Amenities
            </Label>
            <div className="space-y-2">
              {AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={(filters.amenities || []).includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                    className="data-[state=checked]:bg-nd-blue data-[state=checked]:border-nd-blue"
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="text-sm text-gray-700">
                    {getAmenityEmoji(amenity)} {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={onApplyFilters}
            className="w-full bg-nd-blue text-white hover:bg-nd-blue-light"
          >
            Apply Filters
          </Button>
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
