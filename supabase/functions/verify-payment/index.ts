import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function razorpayRequest(endpoint: string) {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID')!
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
  const auth = btoa(`${keyId}:${keySecret}`)

  const response = await fetch(`https://api.razorpay.com/v1${endpoint}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Razorpay API error:', error)
    throw new Error('Failed to fetch from Razorpay')
  }

  return response.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token)
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = userData.user.id

    // Use service role to update subscription
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get user's subscription from DB
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (subError || !subscription) {
      return new Response(JSON.stringify({ error: 'No subscription found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If already active with valid period, skip API call
    if (subscription.status === 'active' && subscription.current_period_end) {
      const periodEnd = new Date(subscription.current_period_end)
      if (periodEnd > new Date()) {
        return new Response(JSON.stringify({ status: 'active', subscription }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Verify with Razorpay API
    if (!subscription.razorpay_subscription_id) {
      return new Response(JSON.stringify({ error: 'No Razorpay subscription ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const rzpSub = await razorpayRequest(`/subscriptions/${subscription.razorpay_subscription_id}`)
    console.log('Razorpay subscription status:', rzpSub.status)

    if (rzpSub.status === 'active' || rzpSub.status === 'authenticated') {
      // Determine period dates from Razorpay or calculate fallback
      const now = new Date()
      let periodStart: string
      let periodEnd: string

      if (rzpSub.current_start) {
        periodStart = new Date(rzpSub.current_start * 1000).toISOString()
      } else {
        periodStart = now.toISOString()
      }

      if (rzpSub.current_end) {
        periodEnd = new Date(rzpSub.current_end * 1000).toISOString()
      } else {
        // Fallback: calculate based on plan_type from DB
        const endDate = new Date(now)
        if (subscription.plan_type === 'annual') {
          endDate.setFullYear(endDate.getFullYear() + 1)
        } else {
          endDate.setMonth(endDate.getMonth() + 1)
        }
        periodEnd = endDate.toISOString()
      }

      const updateData: any = {
        status: 'active',
        razorpay_customer_id: rzpSub.customer_id || subscription.razorpay_customer_id,
        current_period_start: periodStart,
        current_period_end: periodEnd,
      }

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscription.id)

      if (updateError) {
        console.error('Failed to update subscription:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to update subscription' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log('Subscription activated via verification for user:', userId)
      return new Response(JSON.stringify({ status: 'active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ status: rzpSub.status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Verification error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
