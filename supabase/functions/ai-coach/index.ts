import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: Message[];
  type: "coach" | "loan" | "bill";
  context?: {
    transactions?: unknown[];
    budgets?: unknown[];
    goals?: unknown[];
    wallets?: unknown[];
    loans?: unknown[];
    bills?: unknown[];
  };
}

const getSystemPrompt = (type: string, context?: RequestBody["context"]) => {
  const basePrompt = `You are FININCIA, an AI-powered personal financial advisor. You speak in a clear, professional yet friendly tone - like a trusted CA (Chartered Accountant) friend. Always be helpful, concise, and actionable. Use Indian Rupees (₹) for currency. Never provide investment advice or recommend specific stocks/mutual funds.`;

  const contextSummary = context
    ? `\n\nUser's Financial Context:
${context.wallets ? `- Wallets: ${JSON.stringify(context.wallets)}` : ""}
${context.transactions ? `- Recent Transactions: ${JSON.stringify(context.transactions.slice(0, 20))}` : ""}
${context.budgets ? `- Budgets: ${JSON.stringify(context.budgets)}` : ""}
${context.goals ? `- Goals: ${JSON.stringify(context.goals)}` : ""}
${context.loans ? `- Loans: ${JSON.stringify(context.loans)}` : ""}
${context.bills ? `- Recurring Bills: ${JSON.stringify(context.bills)}` : ""}`
    : "";

  switch (type) {
    case "loan":
      return `${basePrompt}

You are the Loan Strategist feature of FININCIA. Your role is to:
1. Analyze the user's loan portfolio
2. Suggest optimal repayment strategies (avalanche vs snowball method)
3. Calculate interest savings from prepayments
4. Predict debt-free dates
5. Help prioritize which loans to pay off first

Always explain your reasoning in simple terms. Provide specific numbers and calculations when possible.${contextSummary}`;

    case "bill":
      return `${basePrompt}

You are the Bill Negotiation Assistant feature of FININCIA. Your role is to:
1. Identify opportunities to reduce recurring bills
2. Generate professional negotiation scripts for phone calls
3. Draft email templates for service providers
4. Suggest retention offers to ask for
5. Track potential savings from negotiations

Provide specific, actionable scripts and templates. Be persuasive but professional.${contextSummary}`;

    default:
      return `${basePrompt}

You are the AI Financial Coach feature of FININCIA. Your role is to:
1. Help users understand their spending patterns
2. Identify opportunities to save money
3. Explain budget overruns and suggest fixes
4. Provide personalized financial advice based on their data
5. Answer questions about personal finance in India

Be conversational and supportive. Use the user's actual financial data to provide relevant insights.${contextSummary}`;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type, context }: RequestBody = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = getSystemPrompt(type, context);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI coach error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
