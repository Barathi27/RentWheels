/*
  # Initial Schema for Vehicle Rental Application

  1. New Tables
    - users (managed by Supabase Auth)
    - vehicles
      - id (uuid, primary key)
      - type (text) - 'car' or 'bike'
      - name (text)
      - image_url (text)
      - price_per_day (integer) - in paise
      - available (boolean)
    - bookings
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - vehicle_id (uuid, references vehicles)
      - start_date (date)
      - end_date (date)
      - aadhaar_number (text)
      - total_amount (integer)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create vehicles table
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('car', 'bike')),
  name text NOT NULL,
  image_url text NOT NULL,
  price_per_day integer NOT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  vehicle_id uuid REFERENCES vehicles NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  aadhaar_number text NOT NULL CHECK (length(aadhaar_number) = 12),
  total_amount integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies for vehicles
CREATE POLICY "Anyone can view vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (true);

-- Policies for bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert sample vehicles
INSERT INTO vehicles (type, name, image_url, price_per_day) VALUES
  ('car', 'Honda City', 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=1000', 250000),
  ('car', 'Hyundai i20', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1000', 200000),
  ('bike', 'Royal Enfield Classic', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000', 100000),
  ('bike', 'Honda CB350', 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=1000', 80000);