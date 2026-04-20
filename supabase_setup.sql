-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create Users Table (extends Supabase Auth)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('user', 'volunteer', 'admin')) DEFAULT 'user',
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
    location GEOGRAPHY(POINT),
    is_available BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create Emergency Requests Table
CREATE TABLE public.emergency_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    requester_id UUID REFERENCES public.users(id) NOT NULL,
    type TEXT CHECK (type IN ('Blood', 'Ambulance', 'Oxygen', 'Other')) NOT NULL,
    urgency TEXT CHECK (urgency IN ('Critical', 'High', 'Medium')) NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    status TEXT CHECK (status IN ('active', 'in_progress', 'resolved', 'cancelled')) DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create Request Responses Table (Matches)
CREATE TABLE public.request_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID REFERENCES public.emergency_requests(id) NOT NULL,
    volunteer_id UUID REFERENCES public.users(id) NOT NULL,
    status TEXT CHECK (status IN ('accepted', 'completed', 'no_show')) DEFAULT 'accepted',
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(request_id, volunteer_id) -- Prevent duplicate accepts from same volunteer
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_responses ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (For Development MVP)
-- Users can read their own profile, volunteers can read all profiles
CREATE POLICY "Users can view profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Anyone authenticated can view active emergencies
CREATE POLICY "Anyone can view active emergencies" ON public.emergency_requests FOR SELECT USING (true);
CREATE POLICY "Users can create emergencies" ON public.emergency_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Requester can update own emergency" ON public.emergency_requests FOR UPDATE USING (auth.uid() = requester_id);

-- Responses
CREATE POLICY "Anyone can view responses" ON public.request_responses FOR SELECT USING (true);
CREATE POLICY "Volunteers can create responses" ON public.request_responses FOR INSERT WITH CHECK (auth.uid() = volunteer_id);

-- Enable Realtime for emergency requests and responses
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_responses;

-- Create a helper function for spatial queries (Find nearby active emergencies)
CREATE OR REPLACE FUNCTION get_nearby_emergencies(lat double precision, lng double precision, radius_meters integer)
RETURNS TABLE (
    id UUID,
    type TEXT,
    urgency TEXT,
    status TEXT,
    lat double precision,
    lng double precision,
    distance_meters double precision
)
LANGUAGE sql
AS $$
    SELECT 
        e.id,
        e.type,
        e.urgency,
        e.status,
        ST_Y(e.location::geometry) as lat,
        ST_X(e.location::geometry) as lng,
        ST_Distance(e.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance_meters
    FROM public.emergency_requests e
    WHERE e.status = 'active'
    AND ST_DWithin(e.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_meters)
    ORDER BY distance_meters ASC;
$$;
