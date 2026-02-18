import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    totalIncome?: number;
    totalExpenses?: number;
    totalBalance?: number;
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

// ============================================
// RAG KNOWLEDGE BASE - Recurring Spend Optimization
// ============================================

const billKnowledgeBase: KnowledgeChunk[] = [
  {
    id: "subscription_audit",
    category: "optimization",
    keywords: ["subscription", "audit", "cancel", "unused", "review", "subscriptions", "streaming", "ott"],
    title: "Subscription Audit Strategy",
    content: `Regular subscription audits can save ₹10-30K annually:

**Monthly Audit Process:**
1. List ALL subscriptions (streaming, apps, magazines, gym, cloud storage)
2. Check last usage date for each
3. Calculate annual cost per subscription
4. Rate value: Essential / Nice-to-have / Unused

**Common Hidden Subscriptions:**
- App store auto-renewals
- Free trials that converted
- Annual renewals forgotten
- Family plans with unused seats

**Decision Framework:**
- Used weekly → Keep
- Used monthly → Evaluate if cheaper alternative exists
- Not used in 30 days → Cancel immediately

**Indian Context:** Average household has 5-8 subscriptions = ₹3,000-8,000/month potential savings.`
  },
  {
    id: "negotiation_timing",
    category: "negotiation",
    keywords: ["when to negotiate", "best time", "timing", "renewal", "call", "leverage"],
    title: "Optimal Negotiation Timing",
    content: `Timing your negotiation maximizes success rate:

**Best Times to Negotiate:**
1. **End of billing cycle** - Providers want to retain before renewal
2. **End of quarter** - Sales teams have targets to meet
3. **After competitor offers** - Use as leverage
4. **After service issues** - Goodwill credits available
5. **Customer anniversaries** - Loyalty rewards time

**Day/Time Tips:**
- Call Tuesday-Thursday (less busy)
- Morning hours (fresh agents, shorter queues)
- Avoid month-end (high call volumes)

**Preparation Checklist:**
✅ Know your account tenure
✅ Have competitor pricing ready
✅ Note any service issues faced
✅ Calculate total spent with provider
✅ Know exact plan details and current rate`
  },
  {
    id: "phone_negotiation_script",
    category: "scripts",
    keywords: ["phone script", "call script", "what to say", "telephone", "negotiation script", "talk"],
    title: "Phone Negotiation Master Script",
    content: `Proven phone negotiation framework:

**Opening:**
"Hi, I'm [Name], account number [X]. I've been a customer for [tenure] and I'm reviewing my bills. I'd like to discuss my plan pricing."

**Building Leverage:**
"I've really enjoyed your service, but I've received offers from [competitor] at [lower price]. I'd prefer to stay with you if we can work something out."

**If Initial Offer Rejected:**
"I understand. Is there a supervisor or retention department I could speak with? I want to make sure I explore all options before making a decision."

**Retention Department Script:**
"I'm considering switching to [competitor] because of price. What can you offer to keep me as a customer? I'm looking for at least [X]% reduction."

**Closing:**
"That works for me. Can you confirm this in writing/email? What's my new monthly amount and when does it take effect?"

**Power Phrases:**
- "What's the best you can do?"
- "I'd hate to leave after being a loyal customer"
- "What retention offers are available?"
- "Can you match this competitor offer?"`
  },
  {
    id: "email_negotiation_template",
    category: "scripts",
    keywords: ["email", "email template", "written", "letter", "formal", "escalation"],
    title: "Email Negotiation Templates",
    content: `Professional email templates for bill reduction:

**Template 1: Initial Request**
Subject: Long-term Customer Seeking Plan Review - Account [Number]

Dear [Provider] Team,

I've been a valued customer for [X years/months] and have always appreciated your service. I'm currently reviewing my monthly expenses and noticed my [service] bill of ₹[amount] is higher than comparable market rates.

I've received offers from competitors at ₹[lower amount] for similar service. Before making any changes, I wanted to reach out to discuss retention offers or plan optimizations.

Could you please review my account and suggest:
1. Any available discounts or promotions
2. Alternative plans with better value
3. Loyalty benefits I may qualify for

I'd prefer to continue our relationship if we can reach a mutually beneficial arrangement.

Best regards,
[Your Name]
Account: [Number]
Phone: [Number]

**Template 2: Escalation Email**
Subject: Escalation Request - Unsatisfactory Resolution - Account [Number]

After [X] years as a customer spending over ₹[total amount], I'm disappointed that my rate reduction request was declined. I'm formally requesting this be escalated to a supervisor.

[Include previous correspondence summary]

If we cannot reach a resolution, I will be forced to explore alternatives effective [date].`
  },
  {
    id: "streaming_optimization",
    category: "category_specific",
    keywords: ["netflix", "amazon", "prime", "hotstar", "streaming", "ott", "disney", "zee5", "sonyliv"],
    title: "Streaming Service Optimization",
    content: `Optimize OTT subscriptions in India:

**Rotation Strategy:**
Instead of all subscriptions simultaneously:
- Month 1-2: Netflix (binge-watch list)
- Month 3-4: Prime Video (different content)
- Month 5-6: Hotstar (sports season)
- Repeat cycle

**Annual vs Monthly:**
- Netflix: ₹199/month vs ₹149/month (annual mobile plan)
- Prime: ₹1,499/year >>> ₹179/month (huge annual savings)
- Hotstar: ₹299/month vs ₹899/year (Annual saves 75%)

**Family/Group Plans:**
- Netflix Premium (4 screens) - Split with 3 others = ₹150/person
- Spotify Family (6 members) - ₹199 total vs ₹119 individual
- YouTube Premium Family - Split cost significantly

**Hidden Bundles:**
- Airtel/Jio plans often include Disney+ Hotstar free
- Amazon Prime includes Prime Video, Music, Shopping benefits
- Vi postpaid includes Netflix on some plans

**Savings Potential:** ₹3,000-6,000/year by optimizing streaming alone.`
  },
  {
    id: "insurance_negotiation",
    category: "category_specific",
    keywords: ["insurance", "premium", "health insurance", "car insurance", "motor", "life insurance", "renewal"],
    title: "Insurance Premium Negotiation",
    content: `Insurance renewal negotiation strategies:

**Health Insurance:**
- Get quotes from 3+ insurers before renewal
- Highlight claim-free years (no-claim bonus)
- Ask about wellness program discounts
- Consider increasing deductible to lower premium
- Review coverage for unused features

**Motor Insurance:**
- No-claim bonus (NCB) can reduce premium by 20-50%
- Anti-theft device discounts (5-10%)
- Voluntary deductible reduces premium
- Compare online vs agent prices
- Transfer NCB when switching insurers

**Negotiation Points:**
"I've been claim-free for [X] years. What loyalty discount applies?"
"This competitor is offering ₹[X] for same coverage. Can you match?"
"I'm willing to increase my deductible for a lower premium."

**Important:**
- Never let policy lapse (lose NCB)
- Renewal notice comes 30 days before - use this time
- Online renewals often 5-10% cheaper than offline

**Average Savings:** 15-25% on renewals by shopping around.`
  },
  {
    id: "telecom_negotiation",
    category: "category_specific",
    keywords: ["phone", "mobile", "airtel", "jio", "vi", "vodafone", "internet", "broadband", "wifi", "postpaid"],
    title: "Telecom & Internet Bill Reduction",
    content: `Telecom negotiation specific strategies:

**Mobile Plans:**
- Prepaid often cheaper than postpaid for same data
- Annual prepaid plans save 15-20% vs monthly
- Family plans: Jio Family, Airtel Family plans
- Corporate/employee discounts (ask HR)

**Broadband Negotiation:**
"I've been paying ₹[X] for [speed]. I see new customers get [higher speed] for same price. Can you upgrade me?"

**Retention Triggers for Telecom:**
- Port-out threat (works every time in India)
- Competitor pricing comparison
- Service quality complaints
- Long customer tenure

**What to Ask For:**
1. Speed upgrade at same price
2. Additional data/benefits
3. Waiver of installation/router charges
4. Contract buyout from competitor

**Timing:**
- End of contract is best leverage point
- New plan launches = negotiate for better deal
- Festive seasons often have retention offers

**Script:**
"I'm getting a better offer from [competitor] and considering porting out. What can you offer to retain me?"

**Expected Outcome:** 10-30% reduction or significant upgrades.`
  },
  {
    id: "utility_optimization",
    category: "category_specific",
    keywords: ["electricity", "water", "gas", "utility", "bijli", "power", "reduce bill"],
    title: "Utility Bill Optimization",
    content: `Reduce electricity and utility costs:

**Electricity Optimization:**
1. **Rate Analysis:** Check if you're on optimal slab
   - Some states have ToD (Time of Day) rates - run heavy appliances during off-peak
2. **Star Ratings:** 5-star rated appliances save 20-40% power
3. **AC Efficiency:** Each degree higher = 3-5% savings. 24-25°C is optimal
4. **LED Transition:** LED vs CFL vs incandescent can reduce lighting costs by 75%

**Quick Wins:**
- Switch off at plug (standby power costs ₹1,000-2,000/year)
- Solar water heater ROI in 2-3 years
- Smart plugs for scheduling

**Water Bill:**
- Fix leaks immediately (dripping tap = 15,000L/year wasted)
- Low-flow fixtures reduce by 40-60%

**Gas/LPG:**
- Pressure cooker saves 70% fuel
- Regulate flame (blue flame = efficient)
- Annual servicing maintains efficiency

**Government Subsidies:**
- Check for energy-efficient appliance subsidies
- Solar panel subsidies in many states

**Monthly Savings Potential:** ₹500-2,000 on utilities.`
  },
  {
    id: "gym_membership",
    category: "category_specific",
    keywords: ["gym", "fitness", "membership", "cult", "gym membership", "workout"],
    title: "Gym & Fitness Membership Optimization",
    content: `Gym membership negotiation strategies:

**Best Times to Negotiate:**
- January (New Year resolution rush - they're flexible)
- August-September (before festive season slowdown)
- End of quarter (sales targets)
- When they're offering promotions (stack discounts)

**Negotiation Points:**
1. "I can pay annually upfront for a discount"
2. "Can you waive the registration fee?"
3. "I'll bring a friend if you give us both a deal"
4. "What's your corporate rate? My company may be interested"

**Alternative Options:**
- Cult.fit: Pay-per-class vs unlimited (calculate which is cheaper)
- Society gym: Often ₹500-1000/month
- Apartment complex gym: Usually included in maintenance
- Outdoor/home workout (₹0)

**Red Flags to Avoid:**
- Long lock-in contracts
- Hidden annual maintenance fees
- Difficult cancellation policies
- Auto-renewal clauses

**Usage Reality Check:**
Calculate cost-per-visit. If you go 8 times/month at ₹3000:
= ₹375/visit. Could be cheaper per-class.

**Savings:** ₹5,000-15,000/year by negotiating or switching.`
  },
  {
    id: "credit_card_fees",
    category: "category_specific",
    keywords: ["credit card", "annual fee", "fee waiver", "card fee", "joining fee"],
    title: "Credit Card Fee Waiver Strategy",
    content: `Get credit card fees waived:

**Annual Fee Waiver Strategies:**
1. **Spend-based waiver:** Many cards waive fee if you spend ₹X/year
2. **Loyalty waiver:** Call and cite tenure + spending history
3. **Retention threat:** "I'll close the card if fee isn't waived"
4. **Upgrade offer:** Sometimes upgrading triggers fee waiver period

**What to Say:**
"I've been a cardholder for [X years] with ₹[total spend]. I'd like the annual fee waived, otherwise I'll need to close this account."

**Success Rate:**
- Premium cards (>₹5,000 fee): 60-70% waiver success
- Regular cards (<₹500 fee): 80-90% waiver success
- First year fees: Often waived for new customers who ask

**Timing:**
- Call 1-2 months BEFORE fee is charged
- If already charged, ask for reversal within 30 days

**If Declined:**
1. Ask for equivalent reward points/vouchers
2. Request supervisor
3. Actually close if benefits don't justify fee

**Alternative Strategy:**
Calculate if rewards earned > annual fee. If yes, paying fee may be worth it.

**Example:** ₹5,000 fee, but you earn ₹8,000 in rewards = Keep the card.`
  }
];

// Semantic similarity keywords for query matching - Bills
const billQueryCategories: Record<string, string[]> = {
  optimization: ["reduce", "optimize", "save", "cut", "lower", "cheap", "expensive", "too much", "audit"],
  negotiation: ["negotiate", "call", "email", "script", "what to say", "how to ask", "talk to"],
  scripts: ["script", "template", "email", "letter", "what to say", "exact words"],
  category_specific: ["netflix", "streaming", "insurance", "phone", "internet", "gym", "electricity", "credit card", "subscription"]
};

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

function retrieveRelevantBillKnowledge(
  query: string,
  userBills: unknown[],
  topK: number = 4
): KnowledgeChunk[] {
  const queryLower = query.toLowerCase();
  const scoredChunks: KnowledgeChunk[] = [];

  for (const chunk of billKnowledgeBase) {
    let score = 0;

    // Keyword matching
    for (const keyword of chunk.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }

    // Category matching based on query intent
    for (const [category, categoryKeywords] of Object.entries(billQueryCategories)) {
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

    // Bill category specific boosting
    if (Array.isArray(userBills)) {
      for (const bill of userBills as Array<{ category?: string; name?: string }>) {
        if (bill.category && chunk.id.includes(bill.category.toLowerCase())) {
          score += 8;
        }
        // Boost streaming content if user has streaming subscriptions
        const billName = (bill.name || "").toLowerCase();
        if ((billName.includes("netflix") || billName.includes("hotstar") || billName.includes("prime")) && 
            chunk.id === "streaming_optimization") {
          score += 10;
        }
        // Boost insurance content for insurance bills
        if (billName.includes("insurance") && chunk.id === "insurance_negotiation") {
          score += 10;
        }
        // Boost telecom for phone/internet bills
        if ((billName.includes("airtel") || billName.includes("jio") || billName.includes("vi") || 
             billName.includes("internet") || billName.includes("broadband")) && 
            chunk.id === "telecom_negotiation") {
          score += 10;
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

function analyzeRecurringSpend(bills: unknown[]): string {
  if (!Array.isArray(bills) || bills.length === 0) {
    return "No recurring bills tracked.";
  }

  const typedBills = bills as Array<{
    name: string;
    amount: number;
    frequency: string;
    category?: string;
    is_negotiated?: boolean;
    savings_achieved?: number;
  }>;

  // Calculate monthly equivalents
  const getMonthlyAmount = (amount: number, frequency: string) => {
    switch (frequency) {
      case "weekly": return amount * 4.33;
      case "quarterly": return amount / 3;
      case "yearly": return amount / 12;
      default: return amount;
    }
  };

  const totalMonthly = typedBills.reduce((sum, b) => sum + getMonthlyAmount(b.amount, b.frequency), 0);
  const totalAnnual = totalMonthly * 12;
  const negotiatedBills = typedBills.filter(b => b.is_negotiated);
  const totalSavings = typedBills.reduce((sum, b) => sum + (b.savings_achieved || 0), 0);

  // Group by category
  const categorySpend: Record<string, number> = {};
  for (const bill of typedBills) {
    const cat = bill.category || "other";
    categorySpend[cat] = (categorySpend[cat] || 0) + getMonthlyAmount(bill.amount, bill.frequency);
  }

  // Find highest spend category
  const sortedCategories = Object.entries(categorySpend).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];

  // Find unnegotiated high-value bills
  const unnegotiatedBills = typedBills
    .filter(b => !b.is_negotiated)
    .sort((a, b) => getMonthlyAmount(b.amount, b.frequency) - getMonthlyAmount(a.amount, a.frequency));
  const topUnnegotiated = unnegotiatedBills.slice(0, 3);

  let analysis = `**Recurring Spend Analysis:**
- Total Monthly Recurring: ₹${totalMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
- Annual Recurring Cost: ₹${totalAnnual.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
- Bills Tracked: ${typedBills.length}
- Already Negotiated: ${negotiatedBills.length}
- Total Savings Achieved: ₹${totalSavings.toLocaleString("en-IN")}

**Spend by Category:**
${sortedCategories.map(([cat, amount]) => `- ${cat}: ₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}/month`).join("\n")}

**Priority Optimization Targets:**
`;

  if (topUnnegotiated.length > 0) {
    analysis += `🎯 Top bills to negotiate:\n`;
    for (const bill of topUnnegotiated) {
      const monthly = getMonthlyAmount(bill.amount, bill.frequency);
      analysis += `   - ${bill.name}: ₹${monthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}/month (potential 10-30% savings)\n`;
    }
  }

  if (topCategory && topCategory[1] > totalMonthly * 0.4) {
    analysis += `\n⚠️ HIGH CONCENTRATION: ${topCategory[0]} accounts for ${((topCategory[1] / totalMonthly) * 100).toFixed(0)}% of recurring spend. Review for optimization opportunities.\n`;
  }

  return analysis;
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

  // Recurring bills analysis
  if (context.bills && Array.isArray(context.bills) && context.bills.length > 0) {
    const typedBills = context.bills as Array<{ name: string; amount: number; frequency: string; category?: string; provider?: string; is_negotiated?: boolean; savings_achieved?: number }>;
    const getMonthly = (b: { amount: number; frequency: string }) => {
      switch (b.frequency) {
        case "weekly": return b.amount * 4.33;
        case "quarterly": return b.amount / 3;
        case "yearly": return b.amount / 12;
        default: return b.amount;
      }
    };
    const totalMonthly = typedBills.reduce((sum, b) => sum + getMonthly(b), 0);
    const totalAnnual = totalMonthly * 12;
    const negotiated = typedBills.filter(b => b.is_negotiated);
    const totalSaved = typedBills.reduce((sum, b) => sum + (b.savings_achieved || 0), 0);
    
    analysis += `\n🔄 RECURRING BILLS & SUBSCRIPTIONS:\n`;
    analysis += `- Total monthly recurring: ₹${totalMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}\n`;
    analysis += `- Total annual recurring: ₹${totalAnnual.toLocaleString("en-IN", { maximumFractionDigits: 0 })}\n`;
    analysis += `- Active subscriptions/bills: ${typedBills.length}\n`;
    if (negotiated.length > 0) {
      analysis += `- Already negotiated: ${negotiated.length} bills, ₹${totalSaved.toLocaleString("en-IN")} saved\n`;
    }
    analysis += `- Bill breakdown:\n`;
    typedBills.forEach(b => {
      analysis += `  • ${b.name}${b.provider ? ` (${b.provider})` : ''}: ₹${b.amount}/${b.frequency}${b.category ? ` [${b.category}]` : ''}${b.is_negotiated ? ' ✅ negotiated' : ''}\n`;
    });
  }

  // Loans analysis  
  if (context.loans && Array.isArray(context.loans) && context.loans.length > 0) {
    const typedLoans = context.loans as Array<{ name: string; current_balance: number; interest_rate: number; emi_amount: number; loan_type: string }>;
    const totalDebt = typedLoans.reduce((sum, l) => sum + (l.current_balance || 0), 0);
    const totalEmi = typedLoans.reduce((sum, l) => sum + (l.emi_amount || 0), 0);
    
    analysis += `\n🏦 LOANS & DEBT:\n`;
    analysis += `- Total outstanding debt: ₹${totalDebt.toLocaleString("en-IN")}\n`;
    analysis += `- Total monthly EMIs: ₹${totalEmi.toLocaleString("en-IN")}\n`;
    analysis += `- Active loans: ${typedLoans.length}\n`;
    typedLoans.forEach(l => {
      analysis += `  • ${l.name} (${l.loan_type}): ₹${l.current_balance.toLocaleString("en-IN")} at ${l.interest_rate}%, EMI ₹${l.emi_amount.toLocaleString("en-IN")}\n`;
    });
  }

  return analysis;
}

// ============================================
// TOPIC VALIDATION - Financial Focus Only
// ============================================

const financialTopicKeywords = [
  // Core financial terms
  "money", "finance", "financial", "budget", "budgeting", "expense", "expenses", "spending", "spend",
  "income", "salary", "saving", "savings", "save", "debt", "loan", "loans", "emi", "interest",
  "investment", "invest", "tax", "taxes", "credit", "debit", "bank", "banking", "account",
  "payment", "pay", "bill", "bills", "cost", "costs", "price", "afford", "wealth", "rich",
  "poor", "broke", "cash", "rupee", "rupees", "₹", "inr", "paisa",
  // Budgeting & planning
  "50/30/20", "50 30 20", "zero based", "envelope", "allocation", "allocate",
  // Savings & goals
  "emergency fund", "goal", "goals", "target", "down payment", "retirement", "corpus",
  // Debt & loans
  "emi", "prepayment", "prepay", "principal", "tenure", "interest rate", "balance transfer",
  "refinance", "avalanche", "snowball", "debt free", "pay off", "payoff",
  // Credit
  "credit card", "credit score", "cibil", "credit limit", "minimum payment",
  // Indian specific
  "80c", "80d", "section 80", "pf", "ppf", "epf", "nps", "lic", "mutual fund", "sip",
  "fd", "fixed deposit", "rd", "recurring deposit", "elss", "huf", "gst",
  // Bills & expenses
  "subscription", "rent", "utility", "groceries", "food", "transport", "fuel", "petrol",
  "electricity", "water", "internet", "phone", "mobile", "insurance", "premium",
  // Financial actions
  "track", "tracking", "manage", "managing", "plan", "planning", "analyze", "analysis",
  "calculate", "calculation", "forecast", "predict", "review", "audit",
  // Financial health
  "net worth", "assets", "liabilities", "liquidity", "cash flow", "surplus", "deficit",
  "overspending", "underspending", "savings rate", "expense ratio",
  // Questions about money
  "how much", "how to save", "how to budget", "where is my money", "am i spending",
  "can i afford", "should i buy", "worth it", "too expensive", "cut costs",
  // Negotiation & optimization
  "negotiate", "negotiation", "reduce", "lower", "optimize", "save money", "cut",
  "discount", "offer", "deal", "cheaper", "expensive"
];

const offTopicIndicators = [
  // General chat
  "hello", "hi there", "how are you", "what's up", "good morning", "good evening",
  "thank you", "thanks", "bye", "goodbye", "see you",
  // Non-financial topics
  "weather", "sports", "cricket", "football", "movie", "movies", "music", "song",
  "recipe", "cooking", "food recipe", "travel", "vacation spot", "tourist",
  "politics", "election", "news", "celebrity", "actor", "actress",
  "joke", "funny", "story", "poem", "write me", "create a story",
  "programming", "code", "coding", "software", "app development",
  "health advice", "medical", "doctor", "medicine", "exercise routine",
  "relationship", "dating", "love", "friendship",
  "homework", "essay", "school project", "college assignment",
  "game", "gaming", "video game", "play",
  // AI/tech questions
  "who made you", "who created you", "are you ai", "what are you", "your name",
  "can you help with", "do you know about"
];

function isFinancialQuery(query: string): { isFinancial: boolean; confidence: number } {
  const queryLower = query.toLowerCase().trim();
  
  // Check for off-topic indicators first
  let offTopicScore = 0;
  for (const indicator of offTopicIndicators) {
    if (queryLower.includes(indicator)) {
      offTopicScore += 10;
    }
  }
  
  // Check for financial topic keywords
  let financialScore = 0;
  for (const keyword of financialTopicKeywords) {
    if (queryLower.includes(keyword.toLowerCase())) {
      financialScore += 15; // Financial keywords have higher weight
    }
  }
  
  // Additional context checks
  if (queryLower.match(/₹\s*\d+|rs\.?\s*\d+|\d+\s*rupees?|\d+k|\d+l|\d+cr/i)) {
    financialScore += 20; // Contains currency amounts
  }
  
  if (queryLower.match(/\d+%|percent|percentage/i)) {
    financialScore += 10; // Contains percentages (interest, savings rate, etc.)
  }
  
  // Short greetings with potential financial follow-up get a pass
  if (queryLower.length < 20 && (queryLower.includes("hi") || queryLower.includes("hello"))) {
    // Check if there's more content that might be financial
    if (financialScore > 0) {
      return { isFinancial: true, confidence: 0.7 };
    }
  }
  
  // Calculate final decision
  const totalScore = financialScore - offTopicScore;
  const confidence = Math.min(1, Math.max(0, (financialScore / 50)));
  
  return {
    isFinancial: totalScore > 0 || financialScore >= 15,
    confidence
  };
}

const getOffTopicResponse = (): string => {
  const responses = [
    "I'm FININCIA, your dedicated financial advisor. I specialize exclusively in personal finance topics like budgeting, saving, debt management, and financial planning. How can I help with your finances today?",
    "I appreciate you reaching out! However, I'm specifically designed to help with financial matters - budgeting, expenses, loans, savings goals, and money management. What financial question can I help you with?",
    "That's outside my expertise! I'm your AI financial coach, focused solely on helping you manage money, track expenses, pay off debt, and achieve financial goals. Ask me anything about your finances!",
    "I'm here to be your personal CFO! While I can't help with that topic, I'd love to assist with budgeting strategies, expense analysis, loan optimization, or any other financial questions you have."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

// ============================================
// SYSTEM PROMPT BUILDER WITH RAG
// ============================================

const getSystemPrompt = (type: string, context?: RequestBody["context"], userQuery?: string) => {
  const basePrompt = `You are FININCIA, an AI-powered personal financial advisor built exclusively for personal finance management. 

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. You ONLY discuss personal finance topics: budgeting, expenses, savings, loans, debt, bills, financial goals, tax planning, and money management.
2. You MUST politely decline ANY question not related to personal finance.
3. If asked about non-financial topics (weather, sports, news, recipes, coding, health, relationships, general knowledge, etc.), respond with: "I'm FININCIA, your dedicated financial advisor. I specialize exclusively in personal finance. How can I help with your money matters today?"
4. Never provide investment advice or recommend specific stocks, mutual funds, or securities.
5. Always use Indian Rupees (₹) for currency examples.
6. Speak in a clear, professional yet friendly tone - like a trusted CA (Chartered Accountant) friend.
7. Be concise and actionable in your advice.
8. Base your responses on the user's actual financial data when available.

EXAMPLES OF WHAT TO DECLINE:
- "Tell me a joke" → Decline, redirect to finance
- "What's the weather?" → Decline, redirect to finance  
- "Write me a poem" → Decline, redirect to finance
- "Who is the Prime Minister?" → Decline, redirect to finance
- "Help me with coding" → Decline, redirect to finance

EXAMPLES OF WHAT TO ANSWER:
- "Where am I overspending?" → Analyze their transactions
- "How to budget with 50/30/20?" → Explain budgeting strategy
- "Should I prepay my loan?" → Provide loan advice
- "How to save for emergency fund?" → Give savings guidance`;

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

FOCUS AREA: Loan and debt management ONLY. Decline any non-loan/debt related questions.

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

    case "bill": {
      // RAG: Retrieve relevant knowledge based on user query
      const relevantBillKnowledge = userQuery 
        ? retrieveRelevantBillKnowledge(userQuery, context?.bills || [])
        : [];
      
      // RAG: Analyze user's recurring spend
      const spendAnalysis = context?.bills 
        ? analyzeRecurringSpend(context.bills)
        : "";

      const ragBillContext = relevantBillKnowledge.length > 0
        ? `\n\n=== RETRIEVED KNOWLEDGE (RAG) ===
Use this curated knowledge to provide accurate, expert advice on reducing recurring expenses:

${relevantBillKnowledge.map((k, i) => `[${i + 1}] ${k.title}:\n${k.content}`).join("\n\n")}
=== END RETRIEVED KNOWLEDGE ===`
        : "";

      const spendContext = spendAnalysis
        ? `\n\n=== USER RECURRING SPEND ANALYSIS ===\n${spendAnalysis}\n=== END SPEND ANALYSIS ===`
        : "";

      return `${basePrompt}

You are the AI Recurring Spend Analyst feature of FININCIA, powered by RAG (Retrieval-Augmented Generation).

FOCUS AREA: Recurring bills, subscriptions, and spend optimization strategies ONLY. Decline any non-bill related questions.

Your role is to:
1. Analyze the user's recurring expenses using the spend analysis provided
2. Use the RETRIEVED KNOWLEDGE to provide accurate, expert strategies
3. Identify opportunities to reduce recurring bills and subscriptions
4. Generate professional negotiation scripts for phone calls
5. Draft email templates for service providers
6. Suggest retention offers and competitive alternatives
7. Calculate potential annual savings from optimizations

IMPORTANT: Base your advice on the retrieved knowledge chunks. Reference specific negotiation tactics, provider-specific tips, and savings strategies. Always provide calculations showing monthly and annual savings potential.
${ragBillContext}${spendContext}${contextSummary}`;
    }

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

FOCUS AREA: Personal finance coaching ONLY. This includes budgeting, saving, spending analysis, and general money management.

Your role is to:
1. Help users understand their spending patterns
2. Identify opportunities to save money using the RETRIEVED KNOWLEDGE
3. Explain budget overruns and suggest fixes based on proven strategies
4. Provide personalized financial advice based on their data
5. Answer questions about personal finance in India

IMPORTANT: 
- Base your advice on the retrieved knowledge chunks
- Reference specific strategies from the knowledge base (like 50/30/20 rule, pay yourself first, etc.) when applicable
- Use the user's actual financial data to make recommendations specific and actionable
- ALWAYS decline non-financial questions politely and redirect to finance topics
${ragContext}${overviewContext}${contextSummary}`;
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;

    // ========== INPUT VALIDATION ==========
    const rawBody = await req.json();

    const { messages, type, context } = rawBody as RequestBody;

    // Validate type
    if (!type || !["coach", "loan", "bill"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: type must be coach, loan, or bill" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages must be an array of 1-50 items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const msg of messages) {
      if (!msg.role || !["user", "assistant"].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: "Invalid message role" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (typeof msg.content !== "string" || msg.content.length === 0 || msg.content.length > 4000) {
        return new Response(
          JSON.stringify({ error: "Each message must be 1-4000 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const totalChars = messages.reduce((sum: number, m: Message) => sum + m.content.length, 0);
    if (totalChars > 20000) {
      return new Response(
        JSON.stringify({ error: "Total message length exceeds limit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== SUBSCRIPTION CHECK FOR PRO FEATURES ==========
    if (type === "loan" || type === "bill") {
      // Whitelisted demo accounts bypass subscription check
      const email = userData.user.email || "";
      const whitelisted = ["dhengre.shantanu2000@gmail.com", "test@razorpay.com"].includes(email);

      if (!whitelisted) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle();

        if (!subscription) {
          return new Response(
            JSON.stringify({ error: "Pro subscription required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

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
      } else if (type === "bill") {
        const retrievedKnowledge = retrieveRelevantBillKnowledge(userQuery, context?.bills || []);
        console.log(`[RAG-Bill] Query: "${userQuery.substring(0, 50)}..."`);
        console.log(`[RAG-Bill] Retrieved ${retrievedKnowledge.length} knowledge chunks:`);
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
