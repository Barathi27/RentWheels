import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Bike } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Vehicle } from '../types';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import VehicleFilters from '../components/VehicleFilters';

export default function Home() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'car' | 'bike'>('all');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // New state for filters
  const [searchTerm, setSearchTerm] = React.useState('');
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 350000]);
  const [showAvailableOnly, setShowAvailableOnly] = React.useState(false);

  React.useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles');
      console.error('Error loading vehicles:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredVehicles = React.useMemo(() => {
    return vehicles.filter(vehicle => {
      // Type filter
      if (filter !== 'all' && vehicle.type !== filter) return false;
      
      // Search term
      if (searchTerm && !vehicle.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Price range
      if (vehicle.price_per_day < priceRange[0] || vehicle.price_per_day > priceRange[1]) {
        return false;
      }
      
      // Availability
      if (showAvailableOnly && !vehicle.available) return false;
      
      return true;
    });
  }, [vehicles, filter, searchTerm, priceRange, showAvailableOnly]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Rent Your Perfect Ride
        </h1>
        <p className="text-lg text-gray-600">
          Choose from our wide selection of cars and bikes
        </p>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Vehicles
        </button>
        <button
          onClick={() => setFilter('car')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
            filter === 'car'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Car className="h-5 w-5" />
          <span>Cars</span>
        </button>
        <button
          onClick={() => setFilter('bike')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
            filter === 'bike'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Bike className="h-5 w-5" />
          <span>Bikes</span>
        </button>
      </div>

      <VehicleFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        showAvailableOnly={showAvailableOnly}
        setShowAvailableOnly={setShowAvailableOnly}
      />

      {filteredVehicles.length === 0 ? (
        <p className="text-center text-gray-600">No vehicles found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={vehicle.image_url}
                alt={vehicle.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {vehicle.name}
                  </h3>
                  {vehicle.type === 'car' ? (
                    <Car className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Bike className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <p className="text-gray-600 mb-4">
                  ₹{(vehicle.price_per_day / 100).toLocaleString('en-IN')}/day
                </p>
                <button
                  onClick={() => navigate(`/book/${vehicle.id}`)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  disabled={!vehicle.available}
                >
                  {vehicle.available ? 'Book Now' : 'Not Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}