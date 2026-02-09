-- Add INSERT policy for subscription_events table
-- Only the service role (used by edge functions/webhooks) can insert events
-- This prevents clients from forging fake payment events

CREATE POLICY "Only service role can insert subscription events"
ON public.subscription_events
FOR INSERT
TO service_role
WITH CHECK (true);