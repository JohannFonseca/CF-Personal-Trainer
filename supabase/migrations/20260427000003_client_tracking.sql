-- Create weight_logs table to track evolution
CREATE TABLE public.weight_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    weight NUMERIC NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create workout_logs table to track completions
CREATE TABLE public.workout_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    notes TEXT
);

-- Enable RLS
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- Policies for weight_logs
CREATE POLICY "Users can view their own weight logs." 
    ON public.weight_logs FOR SELECT 
    USING (auth.uid() = client_id);

CREATE POLICY "Users can insert their own weight logs." 
    ON public.weight_logs FOR INSERT 
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can view all weight logs." 
    ON public.weight_logs FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Policies for workout_logs
CREATE POLICY "Users can view their own workout logs." 
    ON public.workout_logs FOR SELECT 
    USING (auth.uid() = client_id);

CREATE POLICY "Users can insert their own workout logs." 
    ON public.workout_logs FOR INSERT 
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can view all workout logs." 
    ON public.workout_logs FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Set up Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.weight_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_logs;
