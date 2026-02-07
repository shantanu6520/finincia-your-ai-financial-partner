-- Add notification preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_reports_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'weekly' CHECK (notification_frequency IN ('daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS budget_alert_threshold INTEGER DEFAULT 80,
ADD COLUMN IF NOT EXISTS goal_reminder_enabled BOOLEAN DEFAULT true;