-- Add priority and status columns to existing reports table
-- This migration is for adding these columns to an existing table

-- Add priority column
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium'
CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- Add status column
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'assigned', 'in-progress', 'resolved', 'cancelled'));

-- Update any existing records that might have NULL values
UPDATE public.reports
SET priority = 'medium'
WHERE priority IS NULL;

UPDATE public.reports
SET status = 'pending'
WHERE status IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_priority ON public.reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);