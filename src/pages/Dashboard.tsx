import React from 'react';
import { format } from 'date-fns';
import { Car, Bike } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Booking } from '../types';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      <div className="space-y-6">
        {bookings.length === 0 ? (
          <p className="text-gray-600">No bookings found.</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={booking.vehicle?.image_url}
                    alt={booking.vehicle?.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {booking.vehicle?.name}
                    </h3>
                    {booking.vehicle?.type === 'car' ? (
                      <Car className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Bike className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p>{format(new Date(booking.start_date), 'PP')}</p>
                    </div>
                    <div>
                      <p className="font-medium">End Date</p>
                      <p>{format(new Date(booking.end_date), 'PP')}</p>
                    </div>
                    <div>
                      <p className="font-medium">Aadhaar Number</p>
                      <p>XXXX-XXXX-{booking.aadhaar_number.slice(-4)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Total Amount</p>
                      <p>₹{(booking.total_amount / 100).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}