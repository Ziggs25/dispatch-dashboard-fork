-- Create reports table for incident management
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_category TEXT NOT NULL,
  incident_subcategory TEXT NOT NULL,
  incident_title TEXT NOT NULL,
  incident_date DATE NOT NULL,
  incident_time TIME NOT NULL,
  street_address TEXT NOT NULL,
  nearby_landmark TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  brief_description TEXT NOT NULL,
  what_happened TEXT NOT NULL,
  who_was_involved TEXT NOT NULL,
  number_of_witnesses TEXT,
  injuries_reported TEXT,
  property_damage TEXT,
  suspect_description TEXT,
  witness_contact_info TEXT,
  request_follow_up BOOLEAN DEFAULT FALSE,
  share_with_community BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in-progress', 'resolved', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON public.reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_incident_category ON public.reports(incident_category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all reports" ON public.reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert reports" ON public.reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update reports" ON public.reports
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();