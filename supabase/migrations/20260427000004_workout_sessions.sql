-- Tabla para sesiones completas de entrenamiento
CREATE TABLE public.workout_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    finished_at TIMESTAMPTZ,
    duration_minutes INTEGER, -- Calculado al finalizar
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own sessions." 
    ON public.workout_sessions FOR SELECT 
    USING (auth.uid() = client_id);

CREATE POLICY "Users can record their own sessions." 
    ON public.workout_sessions FOR INSERT 
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own sessions." 
    ON public.workout_sessions FOR UPDATE 
    USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all sessions." 
    ON public.workout_sessions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Set up Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_sessions;
