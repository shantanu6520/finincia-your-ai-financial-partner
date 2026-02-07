import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

// ============================================
// RAG KNOWLEDGE BASE - Financial Strategies
// ============================================

interface KnowledgeChunk {
  id: string;
  category: string;
  keywords: string[];
  title: string;
  content: string;
  relevanceScore?: number;
}

const loanKnowledgeBase: KnowledgeChunk[] = [
  {
    id: "avalanche_method",
    category: "loan_strategy",
    keywords: ["avalanche", "high interest", "optimal", "save money", "interest savings", "best strategy", "mathematically"],
    title: "Debt Avalanche Method",
    content: `The Debt Avalanche Method is mathematically the most efficient way to pay off debt:

**How it works:**
1. List all debts from highest to lowest interest rate
2. Pay minimum on all debts
3. Put all extra money toward the highest-interest debt
4. Once paid off, move to the next highest

**Best for:** Those who want to minimize total interest paid and are motivated by numbers.
**Typical savings:** 15-30% less interest compared to minimum payments only.
**Example:** If you have a 24% credit card and 12% personal loan, attack the credit card first regardless of balance.`
  },
  {
    id: "snowball_method",
    category: "loan_strategy",
    keywords: ["snowball", "smallest balance", "motivation", "psychological", "quick wins", "momentum"],
    title: "Debt Snowball Method",
    content: `The Debt Snowball Method focuses on psychological wins:

**How it works:**
1. List all debts from smallest to largest balance
2. Pay minimum on all debts
3. Put all extra money toward the smallest balance
4. Celebrate each payoff, then move to the next

**Best for:** Those who need motivation and quick wins to stay on track.
**Psychology:** Paying off debts quickly releases dopamine and builds momentum.
**Trade-off:** You may pay slightly more interest, but higher completion rate.`
  },
  {
    id: "hybrid_strategy",
    category: "loan_strategy",
    keywords: ["hybrid", "combined", "balanced", "custom", "personalized"],
    title: "Hybrid Debt Strategy",
    content: `The Hybrid Strategy combines the best of both methods:

**How it works:**
1. Pay off one small debt first for a quick win (snowball)
2. Then switch to attacking high-interest debts (avalanche)
3. Adjust based on life events and motivation

**Best for:** Most people who want both psychological wins and mathematical efficiency.
**Tip:** Start with snowball if you're new to debt payoff, graduate to avalanche once you have momentum.`
  },
  {
    id: "prepayment_benefits",
    category: "prepayment",
    keywords: ["prepayment", "lump sum", "bonus", "extra payment", "principal reduction", "tenure reduction"],
    title: "Loan Prepayment Strategies",
    content: `Prepaying loans can save lakhs in interest:

**Types of prepayment:**
1. **Part prepayment:** Pay extra toward principal periodically
2. **Full prepayment:** Close the loan entirely before tenure

**When to prepay:**
- When interest rate > your investment returns
- When you receive bonuses, incentives, or windfalls
- Early in the loan tenure (more interest savings)

**Calculation:** On a ₹50L home loan at 8.5% for 20 years, prepaying ₹5L in year 3 can save ₹8-10L in interest.

**Check for:** Prepayment charges (usually none for floating rate home loans in India after RBI rules).`
  },
  {
    id: "emi_vs_tenure",
    category: "prepayment",
    keywords: ["reduce emi", "reduce tenure", "prepayment choice", "which is better"],
    title: "Reduce EMI vs Reduce Tenure",
    content: `When prepaying, you often get to choose:

**Option 1: Reduce EMI (Keep Tenure)**
- Lower monthly burden
- More cash flow flexibility
- Less total interest savings
- Best if: Cash flow is tight

**Option 2: Reduce Tenure (Keep EMI)**
- Become debt-free faster
- Maximum interest savings
- Same monthly commitment
- Best if: You can afford current EMI

**Recommendation:** If financially stable, always choose tenure reduction for maximum savings.
**Example:** ₹1L prepayment on ₹30L loan at 9% - Tenure reduction saves ₹2.5L more than EMI reduction.`
  },
  {
    id: "balance_transfer",
    category: "interest_optimization",
    keywords: ["balance transfer", "refinance", "lower interest", "switch bank", "better rate"],
    title: "Loan Balance Transfer Strategy",
    content: `Refinancing to a lower rate can save significantly:

**When to consider:**
- Interest rate difference > 0.5% for large loans
- Remaining tenure > 5 years
- Processing fees don't eat up savings

**Process:**
1. Check current rates from multiple lenders
2. Calculate total cost including processing fees
3. Compare with current loan's remaining interest
4. Factor in any prepayment charges

**Costs to consider:**
- Processing fee (usually 0.25-1%)
- Legal/valuation charges
- Documentation charges

**Rule of thumb:** Transfer if you save at least 0.75-1% on home loans.`
  },
  {
    id: "credit_card_optimization",
    category: "interest_optimization",
    keywords: ["credit card", "high interest", "convert to emi", "balance transfer", "24%", "36%", "revolving"],
    title: "Credit Card Debt Optimization",
    content: `Credit cards charge 24-42% interest - the highest of all debts:

**Immediate actions:**
1. Stop using the card for new purchases
2. Pay more than minimum (minimum barely covers interest)
3. Consider converting to EMI (usually 12-15%)
4. Look for balance transfer offers (0% for 3-6 months)

**Priority:** Always pay credit cards before other debts due to extreme interest rates.

**EMI Conversion:** ₹1L credit card debt at 36% = ₹36,000/year interest. Converting to 12% EMI = ₹12,000/year interest.

**Warning:** Balance transfer cards often have fees - calculate total cost.`
  },
  {
    id: "50_30_20_debt",
    category: "budgeting",
    keywords: ["budget", "50 30 20", "allocation", "how much", "afford", "debt payment"],
    title: "50/30/20 Rule for Debt Management",
    content: `Modified budgeting when carrying debt:

**Standard 50/30/20:**
- 50% Needs (rent, utilities, minimum debt payments)
- 30% Wants (entertainment, dining)
- 20% Savings & extra debt payments

**Aggressive debt payoff (50/20/30):**
- 50% Needs
- 20% Wants (reduced)
- 30% Debt payoff & savings

**Recommendation:** Allocate at least 20% of income to debt above minimum payments.

**Quick calculation:** Income ₹1L/month → ₹20K extra toward debt = debt-free years faster.`
  },
  {
    id: "emergency_vs_debt",
    category: "budgeting",
    keywords: ["emergency fund", "savings", "should I save", "debt vs savings", "priorities"],
    title: "Emergency Fund vs Debt Payoff",
    content: `The classic dilemma - save or pay debt?

**Recommended approach:**
1. Build mini emergency fund first (₹25-50K or 1 month expenses)
2. Attack high-interest debt (>12%)
3. Build full emergency fund (3-6 months expenses)
4. Continue moderate debt payoff

**Why some savings first:**
- Prevents new debt during emergencies
- Provides peace of mind
- Avoids penalty for missing payments

**Exception:** If debt interest > 20%, pay it first after just ₹25K emergency fund.`
  },
  {
    id: "interest_negotiation",
    category: "negotiation",
    keywords: ["negotiate", "lower rate", "call bank", "reduce interest", "retention"],
    title: "How to Negotiate Lower Interest Rates",
    content: `Banks often reduce rates if you ask:

**Before calling:**
1. Check competitor rates
2. Know your payment history
3. Calculate your total business with the bank

**Script:**
"I've been a customer for X years with perfect payment history. I've received offers from [competitor] at [rate]%. I'd like to continue with you but need a rate match."

**Leverage points:**
- Good credit score (750+)
- Multiple products with same bank
- Long relationship history
- Competitor offers in writing

**Expected outcome:** 0.25-0.5% reduction is common. Some get up to 1%.`
  },
  {
    id: "home_loan_strategy",
    category: "loan_strategy",
    keywords: ["home loan", "housing loan", "mortgage", "property loan", "real estate"],
    title: "Home Loan Optimization Strategies",
    content: `Home loans are typically the largest debt:

**Key strategies:**
1. **Rate negotiation:** Check rates annually, threaten balance transfer
2. **Prepayment:** No charges on floating rate (RBI rule)
3. **Tax benefits:** Section 80C (principal ₹1.5L) + Section 24 (interest ₹2L)

**Prepayment timing:**
- Best in first 5-7 years (when interest component is highest)
- Even ₹50K/year extra = years saved

**Balance transfer:** Worth it if rate difference > 0.5% and tenure > 7 years remaining.

**Joint loan tip:** Add spouse as co-applicant for better rates and double tax benefits.`
  },
  {
    id: "personal_loan_strategy",
    category: "loan_strategy",
    keywords: ["personal loan", "unsecured", "high emi", "quick payoff"],
    title: "Personal Loan Payoff Strategy",
    content: `Personal loans carry high interest (10-24%):

**Priority:** Pay off quickly - these are expensive debts.

**Strategies:**
1. **Top-up approach:** Instead of new personal loan, consider home loan top-up (lower rate)
2. **Prepay aggressively:** Check for prepayment charges (usually after 6-12 months)
3. **Consolidation:** If multiple personal loans, consolidate at lower rate

**Rule:** Never take a personal loan for lifestyle expenses. Only for genuine emergencies.

**Alternative:** For ₹1-2L needs, consider gold loan (9-12%) instead of personal loan (15-20%).`
  },
  {
    id: "education_loan_strategy",
    category: "loan_strategy",
    keywords: ["education loan", "student loan", "moratorium", "study loan"],
    title: "Education Loan Smart Repayment",
    content: `Education loans have unique features:

**During study (moratorium period):**
- Interest accrues but payment not required
- Simple interest charged (not compound)
- Consider paying interest-only to reduce total burden

**After graduation:**
- Grace period of 6-12 months typically
- Start EMI payments from first salary

**Tax benefit:** Section 80E - entire interest deductible (no limit) for 8 years.

**Strategy:** Pay interest during studies if possible. ₹5K/month during study = ₹3-4L savings over loan life.

**Tip:** Some banks offer reduced rates for girls or students from government colleges.`
  },
  {
    id: "car_loan_strategy",
    category: "loan_strategy",
    keywords: ["car loan", "vehicle loan", "auto loan", "depreciating asset"],
    title: "Car Loan: The Depreciating Asset Trap",
    content: `Cars lose 15-20% value in year 1:

**Key insight:** You're paying interest on a depreciating asset.

**Strategies:**
1. **Minimize loan:** Put maximum down payment (at least 20%)
2. **Short tenure:** 3 years max, not 5-7 years
3. **Prepay quickly:** Cars don't appreciate, close loan fast

**Alternative approach:**
- Buy 1-2 year old certified pre-owned (30-40% cheaper)
- Finance less, own faster

**Warning signs:**
- EMI > 15% of monthly income = overextended
- Loan tenure > 3 years = paying too much interest

**Calculation:** ₹10L car on 7-year loan at 9% = ₹13.5L total. On 3-year loan = ₹11.5L total.`
  }
];

// Semantic similarity keywords for query matching
const queryCategories: Record<string, string[]> = {
  loan_strategy: ["strategy", "method", "approach", "how to pay", "which loan first", "prioritize", "order"],
  debt_management: ["manage", "handle", "control", "reduce", "eliminate", "get out of", "freedom"],
  interest_optimization: ["interest", "rate", "reduce rate", "lower interest", "save interest", "refinance", "transfer"],
  prepayment: ["prepay", "lump sum", "extra payment", "bonus", "one time", "advance payment", "part payment"],
  budgeting: ["budget", "afford", "allocate", "how much", "monthly", "income", "percentage"],
  negotiation: ["negotiate", "talk to bank", "reduce", "settlement", "ask for", "call bank", "lower"]
};

// ============================================
// RAG RETRIEVAL FUNCTIONS
// ============================================

function retrieveRelevantKnowledge(
  query: string,
  userLoans: unknown[],
  topK: number = 4
): KnowledgeChunk[] {
  const queryLower = query.toLowerCase();
  const scoredChunks: KnowledgeChunk[] = [];

  for (const chunk of loanKnowledgeBase) {
    let score = 0;

    // Keyword matching
    for (const keyword of chunk.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }

    // Category matching based on query intent
    for (const [category, categoryKeywords] of Object.entries(queryCategories)) {
      if (chunk.category === category) {
        for (const kw of categoryKeywords) {
          if (queryLower.includes(kw)) {
            score += 5;
          }
        }
      }
    }

    // Title partial matching
    const titleWords = chunk.title.toLowerCase().split(" ");
    for (const word of titleWords) {
      if (queryLower.includes(word) && word.length > 3) {
        score += 3;
      }
    }

    // Loan type specific boosting
    if (Array.isArray(userLoans)) {
      for (const loan of userLoans as Array<{ loan_type?: string; interest_rate?: number }>) {
        if (loan.loan_type && chunk.id.includes(loan.loan_type)) {
          score += 8;
        }
        // Boost credit card content if user has high-interest debt
        if (loan.interest_rate && loan.interest_rate > 18 && chunk.id.includes("credit_card")) {
          score += 7;
        }
      }
    }

    if (score > 0) {
      scoredChunks.push({ ...chunk, relevanceScore: score });
    }
  }

  // Sort by score and return top K
  scoredChunks.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  return scoredChunks.slice(0, topK);
}

function analyzeLoanPortfolio(loans: unknown[]): string {
  if (!Array.isArray(loans) || loans.length === 0) {
    return "No loans in portfolio.";
  }

  const typedLoans = loans as Array<{
    name: string;
    loan_type: string;
    current_balance: number;
    interest_rate: number;
    emi_amount: number;
  }>;

  const totalDebt = typedLoans.reduce((sum, l) => sum + (l.current_balance || 0), 0);
  const totalEMI = typedLoans.reduce((sum, l) => sum + (l.emi_amount || 0), 0);
  const highestInterest = Math.max(...typedLoans.map(l => l.interest_rate || 0));
  const lowestInterest = Math.min(...typedLoans.map(l => l.interest_rate || 0));
  
  const highInterestLoan = typedLoans.find(l => l.interest_rate === highestInterest);
  const sortedByBalance = [...typedLoans].sort((a, b) => a.current_balance - b.current_balance);
  const smallestLoan = sortedByBalance[0];

  let analysis = `**Portfolio Analysis:**
- Total Debt: ₹${totalDebt.toLocaleString("en-IN")}
- Total Monthly EMI: ₹${totalEMI.toLocaleString("en-IN")}
- Interest Range: ${lowestInterest}% - ${highestInterest}%
- Number of Loans: ${typedLoans.length}

**Priority Recommendations:**
`;

  if (highestInterest >= 18) {
    analysis += `⚠️ HIGH PRIORITY: ${highInterestLoan?.name} at ${highestInterest}% should be your #1 target.\n`;
  }

  if (smallestLoan && smallestLoan.current_balance < 50000) {
    analysis += `💡 QUICK WIN: ${smallestLoan.name} (₹${smallestLoan.current_balance.toLocaleString("en-IN")}) - Consider paying off for motivation boost.\n`;
  }

  if (typedLoans.length >= 3) {
    analysis += `📊 Consider loan consolidation with ${typedLoans.length} active loans.\n`;
  }

  return analysis;
}

// ============================================
// SYSTEM PROMPT BUILDER WITH RAG
// ============================================

const getSystemPrompt = (type: string, context?: RequestBody["context"], userQuery?: string) => {
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
    case "loan": {
      // RAG: Retrieve relevant knowledge based on user query
      const relevantKnowledge = userQuery 
        ? retrieveRelevantKnowledge(userQuery, context?.loans || [])
        : [];
      
      // RAG: Analyze user's loan portfolio
      const portfolioAnalysis = context?.loans 
        ? analyzeLoanPortfolio(context.loans)
        : "";

      const ragContext = relevantKnowledge.length > 0
        ? `\n\n=== RETRIEVED KNOWLEDGE (RAG) ===
Use this curated financial knowledge to provide accurate, expert advice:

${relevantKnowledge.map((k, i) => `[${i + 1}] ${k.title}:\n${k.content}`).join("\n\n")}
=== END RETRIEVED KNOWLEDGE ===`
        : "";

      const portfolioContext = portfolioAnalysis
        ? `\n\n=== USER PORTFOLIO ANALYSIS ===\n${portfolioAnalysis}\n=== END PORTFOLIO ANALYSIS ===`
        : "";

      return `${basePrompt}

You are the Loan Strategist feature of FININCIA, powered by RAG (Retrieval-Augmented Generation).

Your role is to:
1. Analyze the user's loan portfolio using the portfolio analysis provided
2. Use the RETRIEVED KNOWLEDGE to provide accurate, expert strategies
3. Suggest optimal repayment strategies (avalanche vs snowball method)
4. Calculate interest savings from prepayments
5. Predict debt-free dates
6. Help prioritize which loans to pay off first

IMPORTANT: Base your advice on the retrieved knowledge chunks. If a strategy is mentioned in the knowledge base, reference it with specific details. Always provide calculations with actual numbers from the user's loans.
${ragContext}${portfolioContext}${contextSummary}`;
    }

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

    // RAG: Extract the latest user query for knowledge retrieval
    const latestUserMessage = messages
      .filter(m => m.role === "user")
      .pop();
    const userQuery = latestUserMessage?.content || "";

    // Log RAG retrieval for debugging
    if (type === "loan" && userQuery) {
      const retrievedKnowledge = retrieveRelevantKnowledge(userQuery, context?.loans || []);
      console.log(`[RAG] Query: "${userQuery.substring(0, 50)}..."`);
      console.log(`[RAG] Retrieved ${retrievedKnowledge.length} knowledge chunks:`);
      retrievedKnowledge.forEach((k, i) => {
        console.log(`  ${i + 1}. ${k.title} (score: ${k.relevanceScore})`);
      });
    }

    // Pass user query for RAG-enhanced prompt generation
    const systemPrompt = getSystemPrompt(type, context, userQuery);

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
