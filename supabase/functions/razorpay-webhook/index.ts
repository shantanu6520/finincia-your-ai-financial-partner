import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
}

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return signature === expectedSignature
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    
    // Verify webhook signature - use the dedicated webhook secret
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!
    
    if (signature && !verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const event = JSON.parse(body)
    console.log('Received webhook event:', event.event)

    // Use service role to bypass RLS for webhook updates
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const payload = event.payload
    const subscriptionId = payload?.subscription?.entity?.id || payload?.payment?.entity?.subscription_id

    if (!subscriptionId) {
      console.log('No subscription ID in event, skipping')
      return new Response(JSON.stringify({ status: 'skipped' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Find subscription in database
    const { data: subscription, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('razorpay_subscription_id', subscriptionId)
      .maybeSingle()

    if (findError || !subscription) {
      console.error('Subscription not found:', subscriptionId, findError)
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the event
    await supabase.from('subscription_events').insert({
      subscription_id: subscription.id,
      event_type: event.event,
      razorpay_event_id: event.id,
      payload: event,
    })

    // Handle different event types
    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const subEntity = payload.subscription.entity
        const now = new Date()
        
        // Calculate period dates with fallback
        let periodStart: string
        let periodEnd: string

        if (subEntity.current_start) {
          periodStart = new Date(subEntity.current_start * 1000).toISOString()
        } else {
          periodStart = now.toISOString()
        }

        if (subEntity.current_end) {
          periodEnd = new Date(subEntity.current_end * 1000).toISOString()
        } else {
          // Fallback based on plan type from DB
          const endDate = new Date(now)
          if (subscription.plan_type === 'annual') {
            endDate.setFullYear(endDate.getFullYear() + 1)
          } else {
            endDate.setMonth(endDate.getMonth() + 1)
          }
          periodEnd = endDate.toISOString()
        }

        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            razorpay_customer_id: subEntity.customer_id,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          })
          .eq('id', subscription.id)
        console.log('Subscription activated:', subscription.id)
        break
      }

      case 'subscription.completed':
      case 'subscription.cancelled': {
        await supabase
          .from('subscriptions')
          .update({
            status: event.event === 'subscription.cancelled' ? 'cancelled' : 'expired',
            cancelled_at: new Date().toISOString(),
          })
          .eq('id', subscription.id)
        console.log('Subscription ended:', subscription.id)
        break
      }

      case 'subscription.paused': {
        await supabase
          .from('subscriptions')
          .update({ status: 'paused' })
          .eq('id', subscription.id)
        console.log('Subscription paused:', subscription.id)
        break
      }

      case 'subscription.resumed': {
        await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('id', subscription.id)
        console.log('Subscription resumed:', subscription.id)
        break
      }

      case 'payment.failed': {
        console.log('Payment failed for subscription:', subscription.id)
        // Could implement retry logic or notification here
        break
      }

      default:
        console.log('Unhandled event type:', event.event)
    }

    return new Response(
      JSON.stringify({ status: 'processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
