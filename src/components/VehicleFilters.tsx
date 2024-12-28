import React from 'react';
import { Search } from 'lucide-react';

interface VehicleFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  showAvailableOnly: boolean;
  setShowAvailableOnly: (show: boolean) => void;
}

export default function VehicleFilters({
  searchTerm,
  setSearchTerm,
  priceRange,
  setPriceRange,
  showAvailableOnly,
  setShowAvailableOnly,
}: VehicleFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range (₹ per day)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="350000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
            <span className="text-sm text-gray-600">
              ₹{(priceRange[1] / 100).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Available Only */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="available"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="available" className="ml-2 text-sm text-gray-700">
            Show available vehicles only
          </label>
        </div>
      </div>
    </div>
  );
}