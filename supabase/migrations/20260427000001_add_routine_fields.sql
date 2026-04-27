-- Add missing fields to client_routines to support a real routine system
ALTER TABLE public.client_routines 
ADD COLUMN sets INTEGER DEFAULT 3,
ADD COLUMN reps TEXT DEFAULT '12',
ADD COLUMN rest_time INTEGER DEFAULT 60, -- in seconds
ADD COLUMN day_of_week INTEGER; -- 0-6 (Sunday-Saturday) or null for "any day"

-- Add a comment for documentation
COMMENT ON COLUMN public.client_routines.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';
