export interface Vehicle {
  id: string;
  type: 'car' | 'bike';
  name: string;
  image_url: string;
  price_per_day: number;
  available: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  vehicle_id: string;
  vehicle?: Vehicle;
  start_date: string;
  end_date: string;
  aadhaar_number: string;
  total_amount: number;
  created_at: string;
}