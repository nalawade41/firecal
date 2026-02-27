FIRE PLANNING APPLICATION – SPECIFICATION DOCUMENT
====================================================
Version: 1.0 (Phase 1)
Currency: INR (calculations are currency-agnostic)


1) WHAT WE ARE DOING
--------------------

We are building a structured financial planning tool that projects
a complete financial life from current age until life expectancy.

The system generates year-by-year projections and calculates:

- Education costs (school + graduation + post graduation)
- Marriage costs
- Whitegoods replacement costs
- Travel and hobbies
- Healthcare expenses
- Living expenses
- Required FIRE corpus
- Portfolio survival till life expectancy

The tool is single-profile. It does not model spouse/partner
separately. The user can round up inputs to represent a family,
a couple, or an individual — that flexibility is by design.


2) WHY WE ARE DOING THIS
------------------------

Spreadsheet-based planning has become:

- Too complex
- Too fragile
- Hard to maintain
- Difficult to scale for multiple kids and glidepath logic

We want:

- Clean deterministic calculations
- One timeline driving all models
- No formula breakage
- Clear separation between Inputs and Calculations
- A system that answers: "Will my money survive?"


3) TECH STACK
-------------

- React (with TypeScript)
- Vite (build tool)
- UI Library: shadcn/ui (Radix primitives + Tailwind under the hood)
  — provides clean component APIs, no 200-class divs, no inline styles
- Modern glassmorphism / translucent + blur design language
- Phase 1: Stateless calculator (no persistence, no database)
- Phase 1: Single scenario only (no comparison mode)


4) GLOBAL CALCULATION RULES
----------------------------

A) Inflation Base
   All "Current" costs are expressed in Current Year currency.
   Inflation is applied from Current Year to the modeled year.
   Formula: Cost in year Y = Current Cost × (1 + inflation)^yearIndex

B) Contribution & Withdrawal Timing
   Contributions (pre-retirement) and withdrawals (post-retirement)
   occur at the BEGINNING of the year, before applying returns.

C) Child Age Interpretation
   Age is treated as integer age at the start of each calendar year.

D) Retirement Year Boundary
   Contributions stop once age >= retirementAge.
   No contribution is made in the retirement year or beyond.
   Withdrawals begin in the retirement year.


5) INPUT PARAMETERS (CONFIGURABLE BY USER)
-------------------------------------------


A) BASE PROFILE

- Current Year
- Current Age
- Retirement Age
- Life Expectancy Age
- Number of Kids (0–5)


B) EXPENSE PROFILE

- Current Annual Household Expense
- Expense Inflation %
- Expense Adjustment Factor at Retirement (optional, default 1.0)

  Clarification:
  This factor is a simple multiplier applied ONLY to core living
  expenses starting from the retirement year.
  Example: factor = 0.7 → living expenses reduce by 30%.

  It DOES NOT apply to:
  Education, Marriage, Whitegoods, Travel, Healthcare, Insurance.
  Those categories behave independently.


C) INVESTMENT PROFILE

- Current Invested Portfolio Value (mandatory)
- Annual Savings / Investment Amount
- Annual Savings Increase % (optional, default 0%)

  Clarification:
  Annual Savings represents the fixed yearly contribution to the
  portfolio during pre-retirement years.
  If Annual Savings Increase % is provided, the contribution grows
  by that percentage each year.

  Pre-retirement: all expenses are paid from salary/income.
  No withdrawals from the portfolio before retirement.
  The portfolio only receives contributions and earns returns.

  Contributions stop once age >= retirementAge (see Section 4D).
  Contributions occur at the beginning of the year (see Section 4B).


D) CHILD PROFILE (ARRAY, UP TO 5)

For each child:
- Current Age
- School Start Age
- Graduation Start Age
- Post Graduation Start Age
- Marriage Age

  Clarification — Age Validation:
  If a child's current age has already passed a milestone start age:
  - Cost applies only for remaining years within the duration window.
  - If the entire milestone window has passed, it is skipped.
  - No retroactive modeling of past costs.

  Example:
  Child age = 20, Graduation start = 18, Duration = 4 years.
  Graduation window = ages 18–21. Child is 20 → 2 years of cost remain.


E) EDUCATION PARAMETERS (GLOBAL — shared across all children)

School:
- Current Annual School Fee
- School Inflation %
- School Duration (years)

Graduation:
- Current Graduation Total Cost
- Graduation Inflation %
- Graduation Duration (years)

Post Graduation:
- Current Post Graduation Total Cost
- Post Graduation Inflation %
- Post Graduation Duration (years)

  Clarification — Cost Interpretation:
  School Fee is ANNUAL.
  Graduation and Post-Graduation costs are TOTAL.

  Total cost is spread evenly across the duration years.
  Example: Graduation total = 40L, Duration = 4 years → 10L/year.
  Each year's portion is then inflated from base year.

  Phase 1: All children share the same cost structure.
  Future enhancement: per-child customization.


F) MARRIAGE PARAMETERS

- Current Marriage Cost Per Child
- Marriage Inflation %


G) WHITEGOODS & REPLACEMENTS (ARRAY)

For each item:
- Item Name
- Current Cost
- Replacement Frequency (years)
- Inflation %

  Clarification — Trigger Logic:
  yearIndex starts at 0 (current year).
  Replacement does NOT trigger at yearIndex = 0.

  Replacement occurs when:
    yearIndex > 0 AND yearIndex % replacementFrequency == 0

  First replacement happens exactly replacementFrequency years from now.
  No initial purchase is modeled — only future replacements.


H) TRAVEL & HOBBIES

- Current Annual Travel Cost
- Travel Inflation %
- Travel Stop Age

  Clarification:
  Travel applies while age <= stopAge.
  Travel becomes zero starting at stopAge + 1.


I) HEALTHCARE

- Current Annual Medical Expense
- Medical Inflation %
- Current Insurance Premium
- Insurance Premium Inflation %

  Clarification:
  Insurance premiums continue until life expectancy.
  No automatic policy expiration in Phase 1.
  Future enhancement: premium stop age.


J) FIRE & RETURN ASSUMPTIONS

- Safe Withdrawal Rate (%)
- Expected Equity Return (%)
- Expected Debt Return (%)

Glidepath Checkpoints (array of age → equity % pairs):

  Clarification — Interpolation:
  Glidepath uses LINEAR INTERPOLATION between checkpoints.

  Before the first checkpoint age: hold that checkpoint's equity %.
  After the last checkpoint age: hold that checkpoint's equity %.
  Between checkpoints: linearly interpolate.

  Example:
  Age 40 → 80% equity, Age 60 → 50% equity.
  At age 50 → 65% equity (midpoint interpolation).
  At age 35 → 80% (hold first checkpoint).
  At age 70 → 50% (hold last checkpoint).

  Debt Allocation = 100% - Equity Allocation.

  Phase 1: All returns and withdrawals modeled PRE-TAX.
  Tax modeling excluded from Phase 1.


5) CALCULATION SECTIONS (SYSTEM GENERATED)
-------------------------------------------


A) MASTER TIMELINE

For each year from current age to life expectancy:

- Year Index (0 = current year)
- Calendar Year
- User Age
- Retirement Status (Pre / Post)
- Years to Retirement (0 if retired)
- Years in Retirement (0 if pre-retirement)
- Child Ages (for each child)

Purpose:
This timeline drives all other calculations.


B) EDUCATION MODEL

For each child and each year:

School Cost applies if:
    childAge >= schoolStartAge
    AND childAge < schoolStartAge + schoolDuration

    Cost = Current Annual School Fee × (1 + schoolInflation)^yearIndex

Graduation Cost applies if:
    childAge >= graduationStartAge
    AND childAge < graduationStartAge + graduationDuration

    Annual portion = Graduation Total Cost / Graduation Duration
    Cost = Annual portion × (1 + gradInflation)^yearIndex

Post Graduation Cost applies similarly to Graduation.

Age validation applies (see Section 4D).

Outputs:
- Education cost per child per year
- Total education cost per year
- Total Education Corpus (sum of all education costs across all years)


C) MARRIAGE MODEL

For each child:

Marriage cost applies only in the year when:
    childAge == marriageAge

Cost = Current Marriage Cost × (1 + marriageInflation)^yearIndex

Output:
- Marriage cost per year
- Total Marriage Corpus (sum of all marriage costs)


D) WHITEGOODS MODEL

For each item:

Replacement triggered when:
    yearIndex > 0 AND yearIndex % replacementFrequency == 0

Cost = Current Item Cost × (1 + itemInflation)^yearIndex

Output:
- Replacement cost per year
- Total replacement cost over lifetime


E) TRAVEL & HOBBY MODEL

Applies annually while age <= travelStopAge.

Cost = Current Annual Travel Cost × (1 + travelInflation)^yearIndex

Output:
- Travel cost per year


F) HEALTHCARE MODEL

Applies annually until life expectancy.

Medical Cost = Current Medical Expense × (1 + medicalInflation)^yearIndex
Insurance Cost = Current Premium × (1 + premiumInflation)^yearIndex

Output:
- Healthcare cost per year (medical + insurance)


G) LIVING EXPENSE MODEL

Pre-Retirement:
    Living Expense = Current Household Expense × (1 + expenseInflation)^yearIndex

Post-Retirement:
    Living Expense = Pre-retirement formula × Expense Adjustment Factor

Note: Living expenses are computed for ALL years (informational).
They are NOT withdrawn from the portfolio pre-retirement.


H) TOTAL ANNUAL EXPENSE

Two separate concepts are tracked:

1. Total Expense (informational, computed for ALL years):

   Total Expense =
       Living Expense
       + Education
       + Marriage
       + Whitegoods
       + Travel
       + Healthcare

2. Withdrawal Amount (used by portfolio simulation):

   Pre-Retirement:  Withdrawal = 0 (all expenses paid from salary)
   Post-Retirement: Withdrawal = Total Expense

The Total Expense table is always shown for visibility.
The Withdrawal Amount drives the portfolio simulation.


I) FIRE CORPUS CALCULATION

This is a GOAL-BASED model. Two separate numbers are tracked:

1. Required FIRE Corpus (retirement lifestyle only):

   Retirement Year Living Expense =
       Living Expense in the first year of retirement
       (with adjustment factor applied)
       + Travel + Healthcare in that year

   Required FIRE Corpus =
       Retirement Year Living Expense / Safe Withdrawal Rate

   This represents the corpus needed to sustain retirement lifestyle
   expenses indefinitely (excluding goal-based lump sums).

2. Goal Corpus (separate bucket):

   Total Goal Corpus =
       Total Education Corpus + Total Marriage Corpus

   Goal costs are tracked and summed independently.
   They are NOT folded into the FIRE corpus calculation.

Note: The portfolio simulation uses actual Total Expense (including
goal costs) for withdrawals. The FIRE Corpus is a benchmark target,
not the simulation driver.


J) PORTFOLIO SIMULATION

For each year:

1. Determine Equity Allocation using glidepath (linear interpolation).
2. Debt Allocation = 1 - Equity Allocation.
3. Blended Return = (Equity % × Equity Return) + (Debt % × Debt Return).

Pre-Retirement (yearIndex where age < retirementAge):

    Annual Contribution =
        Base Annual Savings × (1 + savingsIncrease%)^yearIndex

    Contribution applied at beginning of year (see Section 4B).
    Contributions stop once age >= retirementAge (see Section 4D).

    End Balance =
        (Opening Balance + Annual Contribution) × (1 + Blended Return)

    No withdrawals. All expenses paid from salary.

Post-Retirement (yearIndex where age >= retirementAge):

    Withdrawal = Total Annual Expense (applied at beginning of year).

    If (Opening Balance - Withdrawal) <= 0:
        Portfolio is depleted in this year.
        End Balance = 0.
        Do NOT apply return afterward.
        Mark year as depletion year.

    Otherwise:
        End Balance =
            (Opening Balance - Withdrawal) × (1 + Blended Return)

Stop Conditions:
    Portfolio <= 0 before life expectancy → FAILURE (report depletion year)
    Life expectancy reached with portfolio > 0 → SUCCESS


6) OUTPUTS WE EXPECT
---------------------

Summary Figures:
- Total Education Corpus (sum of all education costs, all children, all years)
- Total Marriage Corpus (sum of all marriage costs)
- Total Goal Corpus = Total Education Corpus + Total Marriage Corpus
  (does NOT include FIRE corpus)
- Required FIRE Corpus
- Corpus Gap = Required FIRE Corpus - Portfolio Opening Balance at Retirement Year
  (i.e., portfolio value at start of retirement year, before first withdrawal)
  (negative gap means surplus)
- Portfolio Survival Result (SUCCESS / FAILURE + depletion year if failed)

Year-by-Year Detailed Tables:
- Education: per child, per year, broken down by school/graduation/PG
  with inflated costs, plus total across children per year
- Marriage: per child, the specific year it triggers, inflated cost
- Whitegoods: per item, per year, inflated replacement costs
- Travel: per year, inflated cost
- Healthcare: per year, medical + insurance, inflated costs
- Living Expenses: per year, inflated, with adjustment factor post-retirement
- Total Annual Expense: per year, sum of all categories
- Portfolio Balance: per year, showing opening balance, contribution/withdrawal,
  returns, and closing balance


7) PHASE 1 SCOPE BOUNDARIES
-----------------------------

Included:
- All calculation models above
- Single scenario
- Stateless (no persistence)
- Pre-tax returns
- Global education costs (shared across children)
- Linear glidepath interpolation
- Insurance premiums until life expectancy

Excluded (future enhancements):
- Multiple scenario comparison
- Per-child education cost customization
- Tax modeling
- Insurance premium stop age
- Data persistence (local storage / database)
- Export to PDF / spreadsheet


END OF DOCUMENT