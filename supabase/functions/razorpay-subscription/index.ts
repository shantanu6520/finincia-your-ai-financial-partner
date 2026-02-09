import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Razorpay Plan IDs - These will be created on first run
const PLANS = {
  monthly: {
    amount: 99900, // ₹999 in paise
    period: 'monthly',
    interval: 1,
    name: 'FININCIA Pro Monthly',
  },
  annual: {
    amount: 799900, // ₹7,999 in paise
    period: 'yearly',
    interval: 1,
    name: 'FININCIA Pro Annual',
  },
}

async function razorpayRequest(endpoint: string, method: string, body?: any) {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID')
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

  if (!keyId || !keySecret) {
    console.error('Razorpay API keys not configured')
    throw new Error('Razorpay API keys not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Edge Function secrets.')
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

  // Defensive response parsing - check content type before parsing
  const contentType = response.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    const textResponse = await response.text()
    console.error('Razorpay returned non-JSON response:', textResponse.substring(0, 500))
    throw new Error('Razorpay returned an invalid response. Please check your API keys.')
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

async function getOrCreatePlan(planType: 'monthly' | 'annual') {
  const planConfig = PLANS[planType]
  
  // Try to find existing plan
  const plans = await razorpayRequest('/plans', 'GET')
  const existingPlan = plans.items?.find((p: any) => 
    p.item.name === planConfig.name && 
    p.item.amount === planConfig.amount
  )

  if (existingPlan) {
    console.log(`Found existing plan: ${existingPlan.id}`)
    return existingPlan.id
  }

  // Create new plan
  console.log(`Creating new plan: ${planConfig.name}`)
  const newPlan = await razorpayRequest('/plans', 'POST', {
    period: planConfig.period,
    interval: planConfig.interval,
    item: {
      name: planConfig.name,
      amount: planConfig.amount,
      currency: 'INR',
      description: `${planConfig.name} - Subscription`,
    },
  })

  console.log(`Created plan: ${newPlan.id}`)
  return newPlan.id
}

async function createSubscription(planId: string, customerId: string | null, userEmail: string) {
  const subscriptionData: any = {
    plan_id: planId,
    total_count: 100, // Max billing cycles (Razorpay limit)
    quantity: 1,
    customer_notify: 1,
  }

  if (customerId) {
    subscriptionData.customer_id = customerId
  } else {
    // Create customer inline
    subscriptionData.notes = { email: userEmail }
  }

  const subscription = await razorpayRequest('/subscriptions', 'POST', subscriptionData)
  console.log(`Created subscription: ${subscription.id}`)
  return subscription
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
    const userEmail = claimsData.user.email || ''
    console.log(`Processing subscription for user: ${userId}`)

    const { planType } = await req.json()
    
    if (!planType || !['monthly', 'annual'].includes(planType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan type. Must be "monthly" or "annual"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for existing active subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'pending'])
      .maybeSingle()

    if (existingSub?.status === 'active') {
      return new Response(
        JSON.stringify({ error: 'You already have an active subscription' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get or create plan
    const planId = await getOrCreatePlan(planType)
    
    // Create Razorpay subscription
    const razorpayCustomerId = existingSub?.razorpay_customer_id || null
    const razorpaySub = await createSubscription(planId, razorpayCustomerId, userEmail)

    // Upsert subscription in database
    const subscriptionData = {
      user_id: userId,
      razorpay_subscription_id: razorpaySub.id,
      razorpay_customer_id: razorpaySub.customer_id,
      plan_type: planType,
      status: 'pending',
      amount: PLANS[planType as 'monthly' | 'annual'].amount,
      currency: 'INR',
    }

    if (existingSub) {
      await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSub.id)
    } else {
      await supabase
        .from('subscriptions')
        .insert(subscriptionData)
    }

    // Return subscription details for frontend checkout
    return new Response(
      JSON.stringify({
        subscription_id: razorpaySub.id,
        key_id: Deno.env.get('RAZORPAY_KEY_ID'),
        amount: PLANS[planType as 'monthly' | 'annual'].amount,
        currency: 'INR',
        name: 'FININCIA',
        description: `FININCIA Pro ${planType === 'monthly' ? 'Monthly' : 'Annual'} Subscription`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Subscription error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create subscription' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
