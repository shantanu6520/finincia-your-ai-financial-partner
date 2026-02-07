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

// ============================================
// RAG KNOWLEDGE BASE - Financial Coach
// ============================================

const coachKnowledgeBase: KnowledgeChunk[] = [
  // Budgeting Strategies
  {
    id: "50_30_20_rule",
    category: "budgeting",
    keywords: ["50 30 20", "budget rule", "how to budget", "income allocation", "spending plan", "budget method"],
    title: "The 50/30/20 Budget Rule",
    content: `The 50/30/20 rule is a simple budgeting framework:

**Allocation:**
- **50% Needs:** Rent, utilities, groceries, insurance, minimum debt payments
- **30% Wants:** Entertainment, dining out, subscriptions, hobbies
- **20% Savings & Debt:** Emergency fund, investments, extra debt payments

**Indian Context:**
For ₹1L monthly income:
- ₹50,000 → Needs
- ₹30,000 → Wants
- ₹20,000 → Savings/Debt

**Tip:** If you're in debt, consider 50/20/30 (flip wants and savings) to accelerate debt payoff.`
  },
  {
    id: "zero_based_budgeting",
    category: "budgeting",
    keywords: ["zero based", "every rupee", "assign money", "envelope", "detailed budget"],
    title: "Zero-Based Budgeting",
    content: `Zero-based budgeting assigns every rupee a job:

**How it works:**
1. Income - Expenses = ₹0 (every rupee is allocated)
2. Create categories for all spending
3. Assign amounts before the month begins
4. Track and adjust as needed

**Best for:** People who want complete control and visibility.

**Example:** ₹80,000 income
- Rent: ₹25,000
- Groceries: ₹8,000
- Transport: ₹5,000
- EMIs: ₹15,000
- Utilities: ₹3,000
- Entertainment: ₹5,000
- Savings: ₹12,000
- Misc: ₹7,000
Total: ₹80,000 (zero remaining)`
  },
  {
    id: "pay_yourself_first",
    category: "savings",
    keywords: ["pay yourself first", "automatic savings", "save first", "savings habit", "before spending"],
    title: "Pay Yourself First Strategy",
    content: `Save before you spend, not after:

**How it works:**
1. Set up automatic transfer on salary day
2. Move savings to a separate account immediately
3. Live on what remains

**Psychology:** You adapt to spending less because you never "see" the savings.

**Implementation:**
- Create a separate savings account
- Set up auto-debit for salary day + 1
- Start with 10%, increase by 1% every quarter

**Target:** Aim for 20-30% savings rate for financial freedom.

**Tip:** Use SIP (Systematic Investment Plan) for automated investing.`
  },
  // Spending Analysis
  {
    id: "spending_categories",
    category: "spending",
    keywords: ["overspending", "where money goes", "spending analysis", "expense tracking", "spending habits"],
    title: "Understanding Spending Patterns",
    content: `Common overspending areas in India:

**Top Money Leaks:**
1. **Food delivery apps:** Swiggy/Zomato can cost ₹8-15K/month without noticing
2. **Subscriptions:** Netflix, Prime, Spotify, gym memberships you don't use
3. **Impulse shopping:** Sale items, online deals, "limited time offers"
4. **Lifestyle inflation:** Upgrading unnecessarily as income grows
5. **Social spending:** Treating others, keeping up appearances

**Fix strategies:**
- Review bank statements monthly
- Categorize every expense for 3 months
- Set category limits
- Use cash for discretionary spending (physical limit)

**Rule of thumb:** If you can't track it, you can't control it.`
  },
  {
    id: "lifestyle_inflation",
    category: "spending",
    keywords: ["lifestyle inflation", "lifestyle creep", "spending more", "salary increase", "raise"],
    title: "Avoiding Lifestyle Inflation",
    content: `Lifestyle inflation: spending more as you earn more.

**The trap:**
- ₹50K salary → ₹45K expenses
- ₹80K salary → ₹75K expenses
- ₹1.2L salary → ₹1.1L expenses

**The fix - 50% rule for raises:**
- Get ₹20K raise? Save ₹10K, enjoy ₹10K
- This builds wealth while rewarding yourself

**Mindset shifts:**
- "Can I afford this?" → "Is this worth delaying my goals?"
- "I deserve this" → "Future me deserves security"

**Practical tip:** Automate savings increase whenever salary increases. Never let the extra money hit your spending account.`
  },
  // Savings Goals
  {
    id: "emergency_fund",
    category: "savings",
    keywords: ["emergency fund", "rainy day", "safety net", "unexpected expense", "job loss", "medical emergency"],
    title: "Building an Emergency Fund",
    content: `Emergency fund: Your financial safety net.

**How much:**
- Minimum: 3 months of expenses
- Recommended: 6 months
- Ideal: 12 months (for freelancers/business owners)

**For Indian context:**
Monthly expenses ₹50K → Emergency fund ₹3-6L

**Where to keep:**
- High-yield savings account (3-4%)
- Liquid mutual funds (5-7%)
- NOT in FDs with lock-in periods

**Building it:**
1. Start with ₹25-50K (1 month)
2. Add ₹5-10K monthly
3. Top up with bonuses
4. Don't touch for non-emergencies

**What counts as emergency:**
✅ Job loss, medical emergency, urgent home repair
❌ Sale shopping, vacation, new phone`
  },
  {
    id: "goal_based_savings",
    category: "savings",
    keywords: ["savings goal", "save for", "target", "vacation", "car", "house", "wedding", "down payment"],
    title: "Goal-Based Savings Strategy",
    content: `Assign savings to specific goals:

**Common goals in India:**
- Emergency fund: 6 months expenses
- Home down payment: 20% of property value
- Children's education: Start early, use equity
- Retirement: 25-30x annual expenses
- Car: Avoid loans, save full amount
- Wedding: 2-3 years advance planning

**How to allocate:**
1. List all goals with target amounts and timelines
2. Calculate monthly contribution needed
3. Prioritize: Emergency > High-interest debt > Goals

**Formula:**
Monthly savings = Target amount ÷ Months remaining

**Example:** ₹5L car in 2 years
₹5,00,000 ÷ 24 months = ₹20,833/month

**Tip:** Keep goal money in separate accounts/funds for clarity.`
  },
  // Income & Expenses
  {
    id: "income_diversification",
    category: "income",
    keywords: ["multiple income", "side hustle", "passive income", "extra money", "income sources", "freelance"],
    title: "Income Diversification Strategies",
    content: `Multiple income streams = Financial security.

**Types of income:**
1. **Active:** Salary, freelancing, consulting
2. **Passive:** Rent, dividends, royalties
3. **Portfolio:** Capital gains, interest

**Side hustle ideas for Indians:**
- Freelancing (writing, design, coding)
- Online tutoring
- Content creation
- Consulting in your expertise
- Selling products online

**Building passive income:**
- Rental property
- Dividend stocks
- REITs
- Digital products
- Systematic withdrawal from investments

**Rule:** Dedicate side income to savings/investments, not lifestyle.`
  },
  {
    id: "expense_reduction",
    category: "spending",
    keywords: ["reduce expenses", "cut costs", "save money", "lower bills", "cheaper alternatives"],
    title: "Practical Expense Reduction Tips",
    content: `Cut expenses without sacrificing quality of life:

**High impact cuts:**
1. **Housing:** Negotiate rent, consider roommate, move to cheaper area
2. **Food:** Cook more, meal prep, reduce delivery
3. **Transport:** Carpool, public transport, maintain vehicle properly
4. **Subscriptions:** Audit and cancel unused ones
5. **Insurance:** Compare and switch providers

**Quick wins:**
- Review and negotiate phone/internet plans
- Use cashback and rewards strategically
- Buy generic brands
- Wait 24-48 hours before non-essential purchases
- Use price comparison tools

**Monthly potential savings:**
- Cook 50% more: ₹5-8K
- Cancel unused subscriptions: ₹1-3K
- Switch plans: ₹500-2K
- Reduce delivery: ₹3-5K

**Total potential:** ₹10-18K/month without major lifestyle changes`
  },
  // Financial Health
  {
    id: "financial_health_score",
    category: "health",
    keywords: ["financial health", "score", "where do I stand", "am I doing well", "assessment", "checkup"],
    title: "Assessing Your Financial Health",
    content: `Key metrics for financial health:

**1. Savings Rate:**
- Poor: <10%
- Average: 10-20%
- Good: 20-30%
- Excellent: >30%

**2. Debt-to-Income Ratio:**
- Healthy: <30% of income goes to debt
- Warning: 30-40%
- Danger: >40%

**3. Emergency Fund:**
- Poor: <1 month
- Average: 1-3 months
- Good: 3-6 months
- Excellent: >6 months

**4. Net Worth Growth:**
- Should increase year over year
- Track assets minus liabilities

**Quick health check:**
✅ Spending < Income (surplus)
✅ Emergency fund exists
✅ No credit card debt
✅ Retirement savings started
✅ Insurance coverage adequate

**Score yourself:** 1 point each, 5/5 = Excellent`
  },
  {
    id: "financial_mistakes",
    category: "health",
    keywords: ["mistake", "wrong", "avoid", "don't do", "common errors", "bad habits"],
    title: "Common Financial Mistakes to Avoid",
    content: `Top financial mistakes and how to avoid them:

**1. No emergency fund**
Fix: Build 3-6 months expenses before investing

**2. Lifestyle inflation**
Fix: Save 50% of every raise

**3. Ignoring insurance**
Fix: Get term life (10x income) and health insurance

**4. Not tracking expenses**
Fix: Use an app, review monthly

**5. Delaying retirement savings**
Fix: Start NOW, even ₹5,000/month grows significantly

**6. Emotional spending**
Fix: 48-hour rule for non-essentials

**7. No financial goals**
Fix: Write specific goals with amounts and dates

**8. Comparing with others**
Fix: Your journey is unique, focus on your progress

**9. Not reviewing finances**
Fix: Monthly 30-minute money date

**10. Avoiding difficult conversations**
Fix: Discuss money with spouse/family regularly`
  },
  // Specific Topics
  {
    id: "tax_saving",
    category: "tax",
    keywords: ["tax", "save tax", "80C", "deduction", "tax planning", "income tax"],
    title: "Tax Saving Strategies for India",
    content: `Maximize tax savings legally:

**Section 80C (₹1.5L limit):**
- ELSS mutual funds (3-year lock-in, market returns)
- PPF (15-year, safe, tax-free returns)
- EPF contribution
- Life insurance premium
- ULIP
- NSC
- Home loan principal

**Section 80D (Health Insurance):**
- Self: ₹25,000
- Parents (senior): ₹50,000
- Total: ₹75,000-1L

**Section 24 (Home Loan Interest):**
- Up to ₹2L for self-occupied property

**Other deductions:**
- NPS: Additional ₹50,000 (80CCD)
- Education loan interest: No limit (80E)
- Donations: 50-100% (80G)

**Priority order:**
1. EPF (automatic, employer match)
2. Health insurance (essential coverage)
3. ELSS (tax saving + wealth creation)
4. NPS (if tax bracket is high)`
  },
  {
    id: "credit_score",
    category: "credit",
    keywords: ["credit score", "CIBIL", "credit report", "improve score", "bad credit", "loan rejection"],
    title: "Understanding and Improving Credit Score",
    content: `Credit score impacts your borrowing ability:

**Score ranges:**
- 750+: Excellent (best rates)
- 700-749: Good
- 650-699: Fair
- Below 650: Poor

**Factors affecting score:**
1. Payment history (35%): Pay on time, always
2. Credit utilization (30%): Keep under 30%
3. Credit age (15%): Don't close old cards
4. Credit mix (10%): Variety helps
5. New credit (10%): Avoid multiple applications

**Improve your score:**
- Set payment reminders/auto-pay
- Pay full credit card balance monthly
- Keep utilization under 30%
- Don't apply for multiple loans together
- Check report for errors annually

**How to check:**
- CIBIL: ₹550/year for detailed report
- Free: One report per year from each bureau

**Timeline:** Improvements show in 3-6 months`
  }
];

// Semantic similarity keywords for query matching - Loans
const loanQueryCategories: Record<string, string[]> = {
  loan_strategy: ["strategy", "method", "approach", "how to pay", "which loan first", "prioritize", "order"],
  debt_management: ["manage", "handle", "control", "reduce", "eliminate", "get out of", "freedom"],
  interest_optimization: ["interest", "rate", "reduce rate", "lower interest", "save interest", "refinance", "transfer"],
  prepayment: ["prepay", "lump sum", "extra payment", "bonus", "one time", "advance payment", "part payment"],
  budgeting: ["budget", "afford", "allocate", "how much", "monthly", "income", "percentage"],
  negotiation: ["negotiate", "talk to bank", "reduce", "settlement", "ask for", "call bank", "lower"]
};

// Semantic similarity keywords for query matching - Coach
const coachQueryCategories: Record<string, string[]> = {
  budgeting: ["budget", "50 30 20", "allocate", "plan", "monthly", "income", "spending plan", "zero based"],
  savings: ["save", "savings", "emergency fund", "goal", "put aside", "accumulate", "rainy day"],
  spending: ["spend", "spending", "overspend", "expense", "where money goes", "lifestyle", "cut cost", "reduce"],
  income: ["income", "earn", "side hustle", "passive", "multiple", "extra money", "freelance"],
  health: ["financial health", "score", "doing well", "assessment", "check", "status", "how am i"],
  tax: ["tax", "save tax", "80c", "deduction", "income tax"],
  credit: ["credit", "cibil", "score", "report", "improve"]
};

// ============================================
// RAG RETRIEVAL FUNCTIONS
// ============================================

function retrieveRelevantLoanKnowledge(
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
    for (const [category, categoryKeywords] of Object.entries(loanQueryCategories)) {
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

function retrieveRelevantCoachKnowledge(
  query: string,
  context: RequestBody["context"],
  topK: number = 4
): KnowledgeChunk[] {
  const queryLower = query.toLowerCase();
  const scoredChunks: KnowledgeChunk[] = [];

  for (const chunk of coachKnowledgeBase) {
    let score = 0;

    // Keyword matching
    for (const keyword of chunk.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }

    // Category matching based on query intent
    for (const [category, categoryKeywords] of Object.entries(coachQueryCategories)) {
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

    // Context-aware boosting
    if (context) {
      // Boost budget content if user has budgets
      if (context.budgets && Array.isArray(context.budgets) && context.budgets.length > 0) {
        if (chunk.category === "budgeting") score += 5;
      }
      // Boost savings content if user has goals
      if (context.goals && Array.isArray(context.goals) && context.goals.length > 0) {
        if (chunk.category === "savings") score += 5;
      }
      // Boost spending content if user has transactions
      if (context.transactions && Array.isArray(context.transactions) && context.transactions.length > 10) {
        if (chunk.category === "spending") score += 5;
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

function analyzeFinancialOverview(context: RequestBody["context"]): string {
  if (!context) return "No financial data available.";

  let analysis = `**Financial Overview:**\n`;

  // Wallet analysis
  if (context.wallets && Array.isArray(context.wallets)) {
    const typedWallets = context.wallets as Array<{ balance: number; name: string; type: string }>;
    const totalBalance = typedWallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    analysis += `💰 Total Balance: ₹${totalBalance.toLocaleString("en-IN")} across ${typedWallets.length} wallets\n`;
  }

  // Transaction analysis
  if (context.transactions && Array.isArray(context.transactions) && context.transactions.length > 0) {
    const typedTx = context.transactions as Array<{ type: string; amount: number }>;
    const income = typedTx.filter(t => t.type === "income").reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = typedTx.filter(t => t.type === "expense").reduce((sum, t) => sum + (t.amount || 0), 0);
    const savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0;
    
    analysis += `📊 Recent Period: Income ₹${income.toLocaleString("en-IN")} | Expenses ₹${expenses.toLocaleString("en-IN")}\n`;
    analysis += `📈 Savings Rate: ${savingsRate}%\n`;
    
    if (Number(savingsRate) < 10) {
      analysis += `⚠️ LOW SAVINGS: Your savings rate is below 10%. Target at least 20%.\n`;
    } else if (Number(savingsRate) >= 30) {
      analysis += `✅ EXCELLENT: Your savings rate is above 30%. Great job!\n`;
    }
  }

  // Budget analysis
  if (context.budgets && Array.isArray(context.budgets) && context.budgets.length > 0) {
    analysis += `📋 Active Budgets: ${context.budgets.length} categories tracked\n`;
  }

  // Goal analysis
  if (context.goals && Array.isArray(context.goals) && context.goals.length > 0) {
    const typedGoals = context.goals as Array<{ status: string; current_amount: number; target_amount: number }>;
    const activeGoals = typedGoals.filter(g => g.status === "active");
    const totalProgress = activeGoals.length > 0
      ? (activeGoals.reduce((sum, g) => sum + (g.current_amount / g.target_amount), 0) / activeGoals.length * 100).toFixed(0)
      : 0;
    analysis += `🎯 Goals: ${activeGoals.length} active, ${totalProgress}% average progress\n`;
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
        ? retrieveRelevantLoanKnowledge(userQuery, context?.loans || [])
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

    default: {
      // RAG: Retrieve relevant financial knowledge based on user query
      const relevantKnowledge = userQuery 
        ? retrieveRelevantCoachKnowledge(userQuery, context)
        : [];
      
      // RAG: Analyze user's financial overview
      const financialOverview = analyzeFinancialOverview(context);

      const ragContext = relevantKnowledge.length > 0
        ? `\n\n=== RETRIEVED KNOWLEDGE (RAG) ===
Use this curated financial knowledge to provide accurate, expert advice:

${relevantKnowledge.map((k, i) => `[${i + 1}] ${k.title}:\n${k.content}`).join("\n\n")}
=== END RETRIEVED KNOWLEDGE ===`
        : "";

      const overviewContext = financialOverview
        ? `\n\n=== USER FINANCIAL OVERVIEW ===\n${financialOverview}\n=== END FINANCIAL OVERVIEW ===`
        : "";

      return `${basePrompt}

You are the AI Financial Coach feature of FININCIA, powered by RAG (Retrieval-Augmented Generation).

Your role is to:
1. Help users understand their spending patterns
2. Identify opportunities to save money using the RETRIEVED KNOWLEDGE
3. Explain budget overruns and suggest fixes based on proven strategies
4. Provide personalized financial advice based on their data
5. Answer questions about personal finance in India

IMPORTANT: Base your advice on the retrieved knowledge chunks. Reference specific strategies from the knowledge base (like 50/30/20 rule, pay yourself first, etc.) when applicable. Use the user's actual financial data to make recommendations specific and actionable.
${ragContext}${overviewContext}${contextSummary}`;
    }
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
    if (userQuery) {
      if (type === "loan") {
        const retrievedKnowledge = retrieveRelevantLoanKnowledge(userQuery, context?.loans || []);
        console.log(`[RAG-Loan] Query: "${userQuery.substring(0, 50)}..."`);
        console.log(`[RAG-Loan] Retrieved ${retrievedKnowledge.length} knowledge chunks:`);
        retrievedKnowledge.forEach((k, i) => {
          console.log(`  ${i + 1}. ${k.title} (score: ${k.relevanceScore})`);
        });
      } else if (type === "coach" || !type) {
        const retrievedKnowledge = retrieveRelevantCoachKnowledge(userQuery, context);
        console.log(`[RAG-Coach] Query: "${userQuery.substring(0, 50)}..."`);
        console.log(`[RAG-Coach] Retrieved ${retrievedKnowledge.length} knowledge chunks:`);
        retrievedKnowledge.forEach((k, i) => {
          console.log(`  ${i + 1}. ${k.title} (score: ${k.relevanceScore})`);
        });
      }
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
