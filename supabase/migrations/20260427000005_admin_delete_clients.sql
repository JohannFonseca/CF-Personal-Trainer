-- Permitir a los admins eliminar perfiles (clientes)
CREATE POLICY "Admins can delete profiles." 
    ON public.profiles FOR DELETE 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
