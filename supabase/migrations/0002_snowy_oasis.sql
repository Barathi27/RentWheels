/*
  # Add more vehicles

  1. Changes
    - Add 5 more cars and 5 more bikes to the vehicles table
    - Update RLS policies to ensure proper access control for bookings
*/

-- Add more cars
INSERT INTO vehicles (type, name, image_url, price_per_day) VALUES
  ('car', 'Toyota Fortuner', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000', 350000),
  ('car', 'Mahindra Thar', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000', 300000),
  ('car', 'MG Hector', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000', 280000),
  ('car', 'Kia Seltos', 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&q=80&w=1000', 250000),
  ('car', 'Maruti Swift', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000', 180000);

-- Add more bikes
INSERT INTO vehicles (type, name, image_url, price_per_day) VALUES
  ('bike', 'Triumph Tiger', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000', 150000),
  ('bike', 'KTM Duke 390', 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=1000', 120000),
  ('bike', 'Yamaha MT-15', 'https://images.unsplash.com/photo-1580310614729-ccd69652491d?auto=format&fit=crop&q=80&w=1000', 90000),
  ('bike', 'Bajaj Pulsar', 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&q=80&w=1000', 70000),
  ('bike', 'TVS Apache', 'https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?auto=format&fit=crop&q=80&w=1000', 85000);

-- Update RLS policies for bookings
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE id = vehicle_id
      AND available = true
    )
  );

-- Add policy to update vehicle availability
CREATE POLICY "Update vehicle availability on booking"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);