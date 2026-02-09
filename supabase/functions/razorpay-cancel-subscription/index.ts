import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function razorpayRequest(endpoint: string, method: string, body?: any) {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID')
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

  if (!keyId || !keySecret) {
    throw new Error('Razorpay API keys not configured')
  }

  const auth = btoa(`${keyId}:${keySecret}`)
  console.log(`Making Razorpay API call to ${endpoint}`)

  const response = await fetch(`https://api.razorpay.com/v1${endpoint}`, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    const textResponse = await response.text()
    console.error('Razorpay returned non-JSON response:', textResponse.substring(0, 500))
    throw new Error('Razorpay returned an invalid response')
  }

  let data
  try {
    data = await response.json()
  } catch (parseError) {
    console.error('Failed to parse Razorpay response:', parseError)
    throw new Error('Razorpay returned a malformed response')
  }
  
  if (!response.ok) {
    console.error('Razorpay API error:', data)
    throw new Error(data.error?.description || 'Razorpay API error')
  }

  return data
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token)
    
    if (claimsError || !claimsData.user) {
      console.error('Auth error:', claimsError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.user.id
    console.log(`Processing cancellation for user: ${userId}`)

    // Get user's active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'pending'])
      .maybeSingle()

    if (subError) {
      console.error('Error fetching subscription:', subError)
      throw new Error('Failed to fetch subscription')
    }

    if (!subscription) {
      return new Response(
        JSON.stringify({ error: 'No active subscription found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!subscription.razorpay_subscription_id) {
      // No Razorpay subscription ID, just update DB
      console.log('No Razorpay subscription ID, updating DB only')
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', subscription.id)

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription cancelled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Cancel subscription in Razorpay
    console.log(`Cancelling Razorpay subscription: ${subscription.razorpay_subscription_id}`)
    
    try {
      const razorpayResult = await razorpayRequest(
        `/subscriptions/${subscription.razorpay_subscription_id}/cancel`,
        'POST',
        { cancel_at_cycle_end: false } // Immediate cancellation
      )
      console.log('Razorpay cancellation response:', razorpayResult)
    } catch (razorpayError: any) {
      // If already cancelled in Razorpay, continue with DB update
      if (!razorpayError.message?.includes('already cancelled')) {
        console.error('Razorpay cancellation failed:', razorpayError)
        // Still proceed to update our DB to cancelled state
      }
    }

    // Update subscription in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      throw new Error('Failed to update subscription status')
    }

    console.log('Subscription cancelled successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscription cancelled successfully',
        cancelled_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Cancellation error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to cancel subscription' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
