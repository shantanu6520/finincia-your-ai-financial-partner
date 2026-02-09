-- Drop the overly permissive service role policy
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.subscriptions;

-- Create a proper policy for webhook updates using service role key validation
-- The webhook will use service role key which bypasses RLS anyway
-- So we just need policies for authenticated users