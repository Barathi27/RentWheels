import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Vehicle } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function BookingForm() {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = React.useState<Vehicle | null>(null);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [aadhaarNumber, setAadhaarNumber] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

  async function loadVehicle() {
    if (!vehicleId) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();

      if (error) throw error;
      setVehicle(data);
    } catch (err) {
      console.error('Error loading vehicle:', err);
      navigate('/');
    }
  }

  function calculateTotalDays() {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function calculateTotalAmount() {
    if (!vehicle) return 0;
    return calculateTotalDays() * vehicle.price_per_day;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicle) return;

    if (aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Start a Supabase transaction
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the booking
      const { error: bookingError } = await supabase.from('bookings').insert({
        vehicle_id: vehicle.id,
        user_id: user.id,
        start_date: startDate,
        end_date: endDate,
        aadhaar_number: aadhaarNumber,
        total_amount: calculateTotalAmount(),
      });

      if (bookingError) throw bookingError;

      // Update vehicle availability
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ available: false })
        .eq('id', vehicle.id);

      if (updateError) throw updateError;

      toast.success('Successfully booked!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!vehicle) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Book {vehicle.name}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <img
          src={vehicle.image_url}
          alt={vehicle.name}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        <p className="text-xl font-semibold text-gray-900 mb-2">
          ₹{(vehicle.price_per_day / 100).toLocaleString('en-IN')}/day
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              min={format(new Date(), 'yyyy-MM-dd')}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              min={startDate || format(new Date(), 'yyyy-MM-dd')}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700">
            Aadhaar Number
          </label>
          <input
            id="aadhaar"
            type="text"
            maxLength={12}
            pattern="\d{12}"
            value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter 12-digit Aadhaar number"
          />
        </div>

        {startDate && endDate && (
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-lg font-medium text-gray-900">
              Total Days: {calculateTotalDays()}
            </p>
            <p className="text-xl font-semibold text-gray-900">
              Total Amount: ₹{(calculateTotalAmount() / 100).toLocaleString('en-IN')}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}