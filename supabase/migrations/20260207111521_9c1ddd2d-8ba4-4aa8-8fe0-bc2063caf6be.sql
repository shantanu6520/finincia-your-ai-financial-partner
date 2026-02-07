-- Remove unused WhatsApp columns from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS whatsapp_number;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS whatsapp_enabled;