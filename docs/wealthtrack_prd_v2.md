# WealthTrack — Pre-Implementation Product Documentation

**Version:** 3.0 · March 2026
**Status:** Ready for Implementation
**Platform:** Web App (React + TypeScript)
**Backend:** Go + AWS Lambda (Serverless)
**Database:** Neon Serverless Postgres (recommended) / DynamoDB (alternative documented)
**UI Reference:** `wealthtrack_v3.html` (glassmorphism design system)
**Scope:** Tracking App — No Advisory / Decision-Making

---

## Table of Contents

1. [Product Requirements Document (PRD)](#document-1--product-requirements-document)
2. [Data Model & Entity Relationships](#document-2--data-model--entity-relationships)
3. [User Flows & Manual vs Automated Matrix](#document-3--user-flows--manual-vs-automated-matrix)
4. [Screen Architecture & UX Specifications](#document-4--screen-architecture--ux-specifications)
5. [Integrations, APIs & Automation](#document-5--integrations-apis--automation-specifications)
6. [Technical Architecture & Implementation Plan](#document-6--technical-architecture--implementation-plan)
7. [Acceptance Criteria & Definition of Done](#document-7--acceptance-criteria--definition-of-done)

---

## Document 1

## Product Requirements Document (PRD)

### 1. Purpose & Scope

WealthTrack is a personal investment portfolio tracking application for Indian retail investors managing goal-based financial plans. It replaces manual Excel-based tracking with automated, real-time visibility across all investment goals and transactions.

**What this app IS:**

-   A tracking and monitoring tool for investments already made

-   A real-time portfolio valuation engine

-   A goal progress visualiser with milestone alerts

-   A transaction log with automated calculations (Buy, Redeem, SIP, STP)

-   A tax harvesting assistant (LTCG tracking)

-   A data-import tool from CAMS / KFintech / broker statements

**What this app is NOT:**

-   Not a financial advisor or recommendation engine

-   Not a fund purchase / transaction execution platform

-   Not a robo-advisor or asset allocation tool

-   Not a tax filing tool

> ⚡ Scope is strictly tracking. The app tells you what is happening, not what to do.

### 2. Target User

  -----------------------------------------------------------------------------------------------------------------—
  **Attribute**         **Profile**
  --------------------- -------------------------------------------------------------------------------------------—
  Age                   30--50, salaried + freelance income

  Investments           Multiple MF folios across 4--8 funds, EPF, NPS, direct equity, gold

  Goals                 FIRE, children's education, marriage, white goods — each with dedicated folios

  Investment style      Lumpsum per goal at start + ongoing SIPs where applicable. Both modes active simultaneously.

  Current pain point    Manually updating NAVs in Excel, no single view across lumpsum + SIP progress per goal

  Technical comfort     Moderate — comfortable with web apps, does not want to manage spreadsheets

  Time budget           Max 5 min/week, 15 min for monthly update
  -----------------------------------------------------------------------------------------------------------------—

### 3. Core Design Principle — Minimum Manual Entry

Every data point that can be fetched, calculated, or inferred must be. The user should only ever manually enter:

  ---------------------------------------------------------------------------------------------------------------------------------—
  **Manual Entry**        **Why it cannot be automated**                                              **Frequency**
  ----------------------- --------------------------------------------------------------------------- -----------------------------—
  Investment amount       User decision — no API knows what someone intends to invest               Per transaction

  Transaction date        Default = today; user changes only for historical entries                   Per transaction (usually auto)

  Folio number            CAS import eliminates this after onboarding                                 Once per folio

  Goal target corpus      User's personal financial decision — never auto-suggested                Annually or on change

  SIP amount + schedule   Instruction to AMC — WealthTrack records what was set up, not decide it   Once per SIP setup

  STP amount + schedule   Same as SIP — records the instruction                                     Once per STP setup

  EPF / NPS balance       No public API for individual EPF/NPS accounts                               Monthly

  Gold weight held        App knows spot price; user enters grams/units held once                     Once (update on purchase)
  ---------------------------------------------------------------------------------------------------------------------------------—

> ⚡ Everything else — current NAV, units, current value, gain/loss, LTCG status, SIP running total, progress % — is fetched or calculated.

### 4. Feature Requirements

#### 4.1 Onboarding & Portfolio Import

  -----------------------------------------------------------------------------------------------------------------------—
  **ID**   **Feature**                                                              **Priority**   **Manual or Auto**
  -------- ------------------------------------------------------------------------ -------------- ----------------------—
  F01      CAS (Consolidated Account Statement) import via CAMS / KFintech PDF      P0             Auto

  F02      Parse CAS: fund name, folio, units, avg cost, full transaction history   P0             Auto

  F03      Manual folio entry fallback (if CAS not available)                       P0             Manual

  F04      Goal assignment — user tags each folio to a goal                       P0             Manual (once)

  F05      Allocation % assignment per fund per goal                                P0             Manual (once)

  F06      EPF balance entry with last-update date                                  P1             Manual (monthly)

  F07      NPS balance entry with last-update date                                  P1             Manual (monthly)

  F08      Gold: enter grams/units held once; spot price auto-fetches               P1             Semi-auto

  F09      Direct equity holdings import via broker statement CSV                   P1             Auto

  F10      Emergency fund balance entry                                             P1             Manual
  -----------------------------------------------------------------------------------------------------------------------—

#### 4.2 NAV & Market Data

  -----------------------------------------------------------------------------------------------------------—
  **ID**   **Feature**                                      **Priority**   **Source**
  -------- ------------------------------------------------ -------------- ----------------------------------—
  F11      Live NAV fetch for all MF folios via AMFI API    P0             AMFI API (auto, daily)

  F12      NAV auto-refresh daily at \~6:30 PM IST          P0             Lambda cron — EventBridge

  F13      NAV auto-fill on transaction date entry          P0             AMFI historical API on-demand

  F14      Manual NAV override for any fund on any date     P1             Manual

  F15      Historical NAV back-fill for past transactions   P1             AMFI historical API

  F16      NSE / BSE live price for direct equity           P2             NSE unofficial API or Yahoo Finance

  F17      Gold spot price auto-fetch (MCX / IBJA)          P2             MCX or IBJA scrape
  -----------------------------------------------------------------------------------------------------------—

#### 4.3 Goal Tracking

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **ID**   **Feature**                                                            **Priority**   **Details**
  -------- ---------------------------------------------------------------------- -------------- --------------------------------------------------------------------------—
  F18      Goal dashboard — one card per goal with all key metrics              P0             Target ₹, Invested ₹, Current value, Gap, Progress %, Required CAGR, Status

  F19      Goal target corpus — user-set, always editable                       P0             Yellow input, persisted, never auto-set

  F20      Total lumpsum needed — auto per fund = alloc% × total needed         P0             Derived from target and allocation %

  F21      Total SIP needed — monthly SIP required to hit target gap            P0             PMT formula: gap / ((1+r)^n - 1) / r × (1+r)

  F22      SIP vs lumpsum split view — how much of target is covered by each    P0             Lumpsum projected value + SIP projected value vs target

  F23      Still to invest (lumpsum) per fund — auto                            P0             = Lumpsum needed − Lumpsum invested

  F24      Required CAGR to hit target from current value                         P0             = (Target / Current Value)^(1/yrs) − 1

  F25      Progress bar — colour-coded: red \<50%, amber 50--90%, green >90%   P0             Live from data

  F26      One folio → one goal mapping enforced                                  P0             Data model constraint

  F27      Years remaining countdown per goal                                     P1             Auto from target year

  F28      Glide path alert: "Move X to debt — 3 years to drawdown"           P1             Auto at T-3 years
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

#### 4.4 SIP Tracking (New Module)

> **✅ ADDED:** Full SIP tracking module — SIPs are tracked separately from lumpsums within each goal.

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **ID**   **Feature**                                                                               **Priority**   **Details**
  -------- ----------------------------------------------------------------------------------------- -------------- ----------------------------------------------------------------------—
  F29      SIP setup per folio: amount, frequency, start date, end date                              P0             User enters once after setting up SIP with AMC

  F30      SIP running total — cumulative SIP invested per folio                                   P0             = COUNT(SIP transactions) × SIP amount. Auto from txn log.

  F31      SIP transaction auto-log — monthly SIP entries generated from schedule                  P1             Creates a pending txn on SIP date. User confirms or edits amount.

  F32      SIP missed flag — if expected SIP not confirmed by user by 5th of month                 P1             Alert: "SIP for [fund] — confirm or mark missed"

  F33      SIP paused / stopped tracking                                                             P0             User can mark SIP as paused/stopped with date

  F34      SIP amount change history                                                                 P1             Track step-ups — store history of amount changes with effective dates

  F35      SIP projection — if current SIP continues at current rate, when does goal hit target?   P1             FV formula: PMT × ((1+r)^n - 1) / r × (1+r)

  F36      SIP + lumpsum combined projection on goal card                                            P0             Shows: "Lumpsum grows to ₹X + SIP grows to ₹Y = ₹Z vs target ₹T"

  F37      SIP step-up reminder — annual prompt to increase SIP by inflation rate                  P2             Push/email on April 1
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

#### 4.5 Transaction Log

  ------------------------------------------------------------------------------------------------------------------------------------------------------—
  **ID**   **Feature**                                                   **Priority**   **Details**
  -------- ------------------------------------------------------------- -------------- ----------------------------------------------------------------—
  F38      Manual transaction entry: Buy / Redeem / SIP / STP / Switch   P0             Date, fund, type, amount; NAV auto-filled; units auto-calculated

  F39      NAV auto-fill on date entry                                   P0             Fetch AMFI historical NAV for entered date

  F40      Units auto-calculated = Amount ÷ NAV                          P0             Never require manual unit entry

  F41      Cumulative units running total per folio                      P0             Live — always current

  F42      SIP transactions distinguished from lumpsum in log            P0             Type field: BUY_LUMPSUM | BUY_SIP | BUY_STP | REDEEM | SWITCH

  F43      CAS import for automatic transaction history                  P1             Eliminates manual back-entry

  F44      Transaction edit + delete with soft-delete audit trail        P1             10-second undo on delete

  F45      Bulk import via CSV (for non-CAS users)                       P2             Template provided in app
  ------------------------------------------------------------------------------------------------------------------------------------------------------—

#### 4.6 LTCG Harvest Tracker

  --------------------------------------------------------------------------------------------------------------------------------------------------—
  **ID**   **Feature**                                                             **Priority**   **Details**
  -------- ----------------------------------------------------------------------- -------------- --------------------------------------------------—
  F46      LTCG per folio — FIFO calculation per tranche                         P0             Transaction log + current NAV → LTCG per unit batch

  F47      Annual ₹1.25L FY limit tracker                                          P0             FY = Apr--Mar. Resets April 1 automatically.

  F48      Remaining harvest room this FY                                          P0             = ₹1.25L − LTCG crystallised this FY

  F49      Harvest alert: Feb 1 — "₹X available to harvest tax-free"           P0             In-app banner + email

  F50      Harvest log: date, fund, units, LTCG crystallised, reinvested into      P0             Manual entry after user executes in brokerage

  F51      STCG / LTCG auto-flag per transaction                                   P0             >365 days from purchase = LTCG

  F52      Cross-asset LTCG warning: direct equity LTCG included in ₹1.25L limit   P1             User enters equity LTCG manually; app aggregates
  --------------------------------------------------------------------------------------------------------------------------------------------------—

#### 4.7 Portfolio Dashboard

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **ID**   **Feature**                                                                        **Priority**   **Details**
  -------- ---------------------------------------------------------------------------------- -------------- -----------------------------------------------------—
  F53      Total net worth — all assets                                                     P0             MF + EPF + NPS + Gold + Equity + Emergency fund

  F54      Asset allocation chart — donut/bar                                               P0             Large cap / Mid / Small / Intl / Debt / Gold breakdown

  F55      Goal progress summary — all goals in one view                                    P0             Cards with progress bars + status badges

  F56      Portfolio P&L — total invested vs current vs target                              P0             Single number view at portfolio level

  F57      FIRE tracker widget — corpus needed vs current, years remaining, required CAGR   P0             Prominent on home

  F58      SIP health check — are all SIPs running? Any missed?                             P1             Status per SIP with last confirmed date

  F59      Monthly SIP total — how much goes in each month across all goals                 P1             Cashflow visibility

  F60      Gain/loss heatmap — fund-level performance tiles                                 P1             Colour-coded return % per fund
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------—

#### 4.8 Alerts & Reminders

  -------------------------------------------------------------------------------------------------------------------------—
  **ID**   **Alert**                           **Trigger**                                 **Channel**
  -------- ----------------------------------- ------------------------------------------- --------------------------------—
  F61      LTCG harvest window open            Feb 1 each year                             Email + in-app banner

  F62      Glide path reminder                 T-3 years before goal drawdown date         Email + in-app

  F63      Monthly update reminder (EPF/NPS)   First week of each month                    In-app (dismissible)

  F64      Annual plan review                  April 1 (new FY)                            Email + in-app

  F65      Goal behind track                   Progress% \< 40% of expected at this date   In-app only

  F66      SIP confirmation pending            5th of month if SIP txn not confirmed       In-app

  F67      STP ending soon                     30 days before STP end date                 In-app

  F68      SIP step-up reminder                April 1 annually                            Email (optional, user preference)
  -------------------------------------------------------------------------------------------------------------------------—

### 5. Non-Functional Requirements

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Category**       **Requirement**
  ------------------ ----------------------------------------------------------------------------------------------------------------------------------------------------—
  Performance        Dashboard loads \<2 sec. NAV refresh runs in background — never blocks UI. Lambda cold start mitigated by provisioned concurrency on home endpoint.

  Security           No trade execution capability. All folio numbers encrypted at rest. Google OAuth only (no password storage). HTTPS everywhere.

  Privacy            All financial data encrypted. No data sold. DPDP Act 2023 compliant. User can delete account + all data at any time.

  Offline            Last-synced data readable offline. Transactions entered offline queue and sync on reconnect.

  Platform           Web app (React + TypeScript). Mobile-responsive. PWA for home screen install on iOS/Android.

  Export             Full data export as Excel or CSV, always available, always free.

  Availability       99.5% uptime target. AMFI API outage handled gracefully — show last NAV with timestamp, never error.
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------—

---

## Document 2

## Data Model & Entity Relationships

### 1. Core Entities

#### 1.1 User

  -------------------------------------------------------------------------—
  **Field**          **Type**          **Notes**
  ------------------ ----------------- ------------------------------------—
  user_id            UUID PK

  name               String

  age                Integer           Used for FIRE countdown

  monthly_expense    Decimal (paise)   Current monthly living cost

  fire_target_age    Integer

  swr_rate           Decimal           Default 0.0275

  inflation_rate     Decimal           Default 0.06

  created_at         Timestamp
  -------------------------------------------------------------------------—

#### 1.2 Goal

  ------------------------------------------------------------------------------------------------------—
  **Field**          **Type**           **Notes**
  ------------------ ------------------ ----------------------------------------------------------------—
  goal_id            UUID PK

  user_id            UUID FK → User

  name               String             e.g. "FIRE", "Reyaansh School"

  type               Enum               FIRE | SCHOOL | GRADUATION | MARRIAGE | WHITE_GOODS | CUSTOM

  target_corpus      Integer (paise)    User-set — never auto-calculated

  target_year        Integer

  horizon_years      Integer            Auto = target_year − current_year

  notes              Text
  ------------------------------------------------------------------------------------------------------—

#### 1.3 Fund (master data — shared across all users)

  -----------------------------------------------------------------------------------------------------------------------------------—
  **Field**          **Type**        **Notes**
  ------------------ --------------- ------------------------------------------------------------------------------------------------—
  fund_id            UUID PK

  amfi_code          String UNIQUE   Primary key for NAV fetch from AMFI

  name               String          Full fund name

  amc                String

  category           Enum            LARGE_CAP_INDEX | FLEXI_CAP | MID_CAP_INDEX | SMALL_CAP | DEBT_SHORT | DEBT_LIQUID | HYBRID

  isin               String          ISIN for direct plan
  -----------------------------------------------------------------------------------------------------------------------------------—

#### 1.4 Folio

  ---------------------------------------------------------------------------------------—
  **Field**          **Type**          **Notes**
  ------------------ ----------------- --------------------------------------------------—
  folio_id           UUID PK

  user_id            UUID FK → User

  goal_id            UUID FK → Goal    Each folio belongs to exactly one goal — enforced

  fund_id            UUID FK → Fund

  folio_number       String            From CAS import or manual entry

  allocation_pct     Decimal           0.25 = 25% of this goal's lumpsum goes here

  sip_active         Boolean

  sip_amount         Integer (paise)   Current monthly SIP amount

  sip_frequency      Enum              MONTHLY | QUARTERLY

  sip_start_date     Date

  sip_end_date       Date              Null if ongoing

  stp_active         Boolean

  stp_amount         Integer (paise)

  stp_start_date     Date

  stp_end_date       Date

  created_at         Timestamp
  ---------------------------------------------------------------------------------------—

#### 1.5 SIP History (step-up tracking)

> **✅ ADDED:** New entity to track SIP amount changes over time — enables accurate historical SIP invested calculation.

  ------------------------------------------------------------------------------—
  **Field**          **Type**          **Notes**
  ------------------ ----------------- -----------------------------------------—
  sip_history_id     UUID PK

  folio_id           UUID FK → Folio

  amount             Integer (paise)   SIP amount for this period

  effective_from     Date              Date this SIP amount became active

  effective_to       Date              Null if currently active

  reason             String            e.g. "Annual step-up", "Initial setup"
  ------------------------------------------------------------------------------—

#### 1.6 Transaction

  -----------------------------------------------------------------------------------------------------------------------------—
  **Field**          **Type**                 **Notes**
  ------------------ ------------------------ ---------------------------------------------------------------------------------—
  txn_id             UUID PK

  folio_id           UUID FK → Folio

  date               Date

  type               Enum                     BUY_LUMPSUM | BUY_SIP | BUY_STP | REDEEM | SWITCH_IN | SWITCH_OUT | DIVIDEND

  amount             Integer (paise)          User enters this

  nav                Integer (paise × 1000)   Auto-fetched from AMFI; manual override allowed

  units              Decimal (6dp)            Auto-calculated = amount ÷ nav

  source             Enum                     MANUAL | CAS_IMPORT | SIP_PENDING | SIP_CONFIRMED

  notes              Text

  created_at         Timestamp
  -----------------------------------------------------------------------------------------------------------------------------—

#### 1.7 NAV History (cached)

  -------------------------------------------------------------------------------------—
  **Field**          **Type**                    **Notes**
  ------------------ --------------------------- --------------------------------------—
  fund_id            UUID FK → Fund

  date               Date

  nav                Integer (paise × 1000)

  source             Enum                        AMFI_DAILY | AMFI_HISTORICAL | MANUAL

  PK                 Composite (fund_id, date)
  -------------------------------------------------------------------------------------—

#### 1.8 Non-MF Asset

  -------------------------------------------------------------------------------------------------------------------—
  **Field**          **Type**                    **Notes**
  ------------------ --------------------------- --------------------------------------------------------------------—
  asset_id           UUID PK

  user_id            UUID FK → User

  goal_id            UUID FK → Goal (nullable)   EPF/NPS are not goal-specific — they are retirement layers

  type               Enum                        EPF | NPS | GOLD | SILVER | DIRECT_EQUITY | FD | EMERGENCY_FUND

  name               String                      e.g. "EPF - Infosys", "SGB 2023-24 Series I"

  current_value      Integer (paise)             Manually updated

  invested_value     Integer (paise)

  quantity           Decimal (nullable)          Grams for Gold — so value auto-updates with spot price

  last_updated       Date
  -------------------------------------------------------------------------------------------------------------------—

#### 1.9 LTCG Harvest Record

  ---------------------------------------------------------------------------------------------------—
  **Field**                  **Type**                     **Notes**
  -------------------------- ---------------------------- -------------------------------------------—
  harvest_id                 UUID PK

  user_id                    UUID FK → User

  financial_year             String                       e.g. "2025-26"

  date                       Date

  folio_id                   UUID FK → Folio

  units_redeemed             Decimal

  cost_basis                 Integer (paise)              FIFO-calculated

  redemption_value           Integer (paise)

  ltcg_crystallised          Integer (paise)              Auto = redemption − cost basis

  tax_payable                Integer (paise)              Auto = MAX(0, cum_fy_total − 125000) × 0.125

  reinvested_into_folio_id   UUID FK → Folio (nullable)

  reinvestment_date          Date (nullable)
  ---------------------------------------------------------------------------------------------------—

### 2. Key Calculated Fields (never stored — computed on read)

  ------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Field**                        **Formula**                                                               **Used in**
  -------------------------------- ------------------------------------------------------------------------- -------------------------------------------—
  Current units per folio          SUM(units for BUY\*) − SUM(units for REDEEM)                              Folio valuation

  Current value per folio          Current units × Latest NAV                                                All goal cards

  Lumpsum invested per folio       SUM(amount WHERE type = BUY_LUMPSUM)                                      Goal summary panel

  SIP invested per folio           SUM(amount WHERE type = BUY_SIP)                                          Goal summary panel — separate from lumpsum

  Total invested per folio         Lumpsum invested + SIP invested + STP invested                            Gain/loss

  Gain/Loss per folio              Current value − Total invested                                            P&L

  Gain % per folio                 Gain/Loss ÷ Total invested                                                Fund performance

  LTCG sitting (approx)            FIFO: for tranches >365 days old, (current NAV − purchase NAV) × units   LTCG tracker

  Lumpsum needed per folio         Goal.target_corpus × Folio.allocation_pct × lumpsum_fraction              Section A in goal detail

  SIP needed (monthly) per folio   PMT(r/12, months_remaining, −lumpsum_projected_shortfall)                 SIP tracker

  Still to invest (lumpsum)        MAX(0, lumpsum_needed − lumpsum_invested)                                 Goal folio register

  Required CAGR                    (Target ÷ Current Value)^(1/horizon_years) − 1                           Goal summary panel

  Progress %                       Current Value ÷ Goal.target_corpus                                        Progress bars

  LTCG FY running total            SUM(ltcg_crystallised) WHERE financial_year = current_fy                  LTCG tracker

  Remaining harvest room           MAX(0, 125000 − ltcg_fy_total)                                            LTCG alert

  FIRE corpus needed               monthly_expense × (1+inflation)^horizon × 12 ÷ swr_rate                  FIRE widget
  ------------------------------------------------------------------------------------------------------------------------------------------------------—

---

## Document 3

## User Flows & Manual vs Automated Matrix

> **🔄 UPDATED:** Onboarding flow redesigned from a flat 12-step checklist into a 9-step conversational wizard. Each step is a focused question with appropriate input controls — not a form dump.

### 1. First-Time Onboarding — 9-Step Wizard

The onboarding wizard runs immediately after first login, before the user sees the dashboard. A progress bar fills across all 9 steps. Every step has a Back button — no data is lost if the user goes back.

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Step**   **Title**             **What user does**                           **Key inputs**                                                                                                            **Time**
  ---------- --------------------- -------------------------------------------- ------------------------------------------------------------------------------------------------------------------------- -------—
  1          Profile               Enter basic profile                          Name, current age, monthly household expenses                                                                             1 min

  2          FIRE goal             Set FIRE parameters                          FIRE target age, safe withdrawal rate (2.5--3.5%), inflation assumption                                                   1 min

  3          Import method         Choose how to import existing MFs            Select one: CAS import (recommended) / Manual entry / No existing investments                                             30 sec

  4          Goals                 Select all goals being invested for          Multi-select from: FIRE, School fees, Graduation, Marriage, House, Custom                                                 1 min

  5          Goal details          Set target and year for each selected goal   Per goal: target corpus ₹ + target year. One expandable block per goal.                                                   3 min

  6          Lumpsum investments   Enter each lumpsum already deployed          Per lumpsum: fund, amount, date, which goal, folio number (optional). Add/remove rows.                                    3 min

  7          SIPs                  Enter each active SIP                        Per SIP: fund, monthly amount, SIP date (day of month), start date, which goal. Add/remove rows.                          3 min

  8          Other assets          Enter non-MF balances                        EPF: balance + monthly employer contribution. NPS: balance + contribution. Gold: grams + type. Emergency fund: balance.   3 min

  9          Confirmation          Review and confirm all entries               Read-only summary of all steps. Tap "Go to dashboard" to finish.                                                        1 min
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

> ⚡ Total onboarding time: \~16 minutes. After step 9, the dashboard populates instantly with all entered data + live NAVs.

##### Step 3 — Import Method Detail

Three choices presented as large tappable option cards:

-   CAS import (recommended) — user emails cas@camsonline.com or mystatement@kfintech.com, receives password-protected PDF, uploads it. App auto-extracts all folios, transaction history, units, average cost.

-   Manual entry — user adds funds one by one. More effort but works without CAS. Steps 6 and 7 become the primary data source.

-   No existing investments — user is starting fresh. Steps 6 and 7 are still shown so they can log their first lumpsum and SIP immediately.

##### Step 4 — Goal Selection Detail

Six goal type cards displayed in a 3×2 grid. User can select multiple. Each card shows icon + name + one-line description. Selected cards highlight in green. Selections drive which blocks appear in Step 5.

  -------------------------------------------------------------------------------------------—
  **Goal type**          **Icon**   **Default horizon hint**   **Investment default**
  ---------------------- ---------- -------------------------- ------------------------------—
  FIRE                   🔥         Years to target age        Lumpsum + SIP

  School fees            🏫         Years to school start      Lumpsum (debt fund)

  Graduation             🎓         Years to college entry     Lumpsum + SIP

  Marriage               💍         Years to target age 25     Lumpsum only

  House / down payment   🏡         User defined               Lumpsum + SIP

  Custom                 ✦          User defined               User defined
  -------------------------------------------------------------------------------------------—

##### Step 6 — Lumpsum Entry Detail

One entry block per lumpsum. User can add and remove blocks freely. Each block contains:

-   Fund name — dropdown of known funds + "Other" option

-   Amount invested ₹ — numeric input

-   Investment date — date picker

-   Which goal — dropdown of goals selected in Step 4

-   Folio number — optional text field (CAS import will fill this later if not known)

> ⚡ If user chose CAS import in Step 3, this step is pre-populated from the CAS parse. User reviews and confirms rather than entering from scratch.

##### Step 7 — SIP Entry Detail

One entry block per SIP. Each block contains:

-   Fund name — dropdown

-   Monthly SIP amount ₹

-   SIP date — day of month (e.g. 5, 15, 28)

-   SIP start date — date picker

-   Which goal — dropdown

> ⚡ If 0 SIPs are entered in this step, the app renders the lumpsum-only dashboard state after onboarding. The user can add SIPs later from Goal Detail at any time.

##### Step 8 — Other Assets Detail

All non-MF assets captured on one screen in four fixed sections (not add/remove rows — these are standard assets):

  -------------------------------------------------------------------------------------------------------------------------—
  **Asset**        **Fields captured**                                  **How it auto-updates later**
  ---------------- ---------------------------------------------------- ---------------------------------------------------—
  EPF              Current balance ₹, monthly employer contribution ₹   Manual update monthly — no API

  NPS              Current balance ₹, monthly own contribution ₹        Manual update monthly — no API

  Gold / Silver    Grams held, type (Physical / SGB / ETF)              App fetches MCX spot price × grams — user confirms

  Emergency fund   Current balance ₹                                    Manual update when it changes
  -------------------------------------------------------------------------------------------------------------------------—

##### Step 9 — Confirmation Summary

Read-only summary showing one row per category: Profile, Goals set up, Lumpsum investments, Active SIPs, Other assets. Each row shows a brief digest (e.g. "4 goals · FIRE, School, Grad, Marriage"). User can tap Back to correct anything. "Go to dashboard" button saves everything and navigates to the dashboard.

### 2. Ongoing User Flows

All ongoing flows from v2 remain unchanged: logging a new transaction (30 seconds), monthly update routine (5 minutes), annual LTCG harvest, annual plan review. See v2 for full detail.

### 3. Manual vs Automated Matrix

Unchanged from v2 — see wealthtrack_prd_v2.docx Doc 3, Section 6.

---

## Document 4

## Screen Architecture & UX Specifications

> **🔄 UPDATED:** Three new screens added (Login, Add New Goal wizard, Lumpsum-only dashboard state). Design system fully specified. Four new UX principles added.

### 1. Navigation Structure

Top navigation bar (sticky, glass-frosted dark) with 6 items. Topbar is hidden on the Login and Onboarding screens — appears only from the Dashboard onwards.

  -----------------------------------------------------------------------------------------------—
  **Nav item**     **Always visible?**   **Primary purpose**
  ---------------- --------------------- --------------------------------------------------------—
  Dashboard        Yes                   Net worth + FIRE tracker + goal cards overview

  Goals            Yes                   Goal detail — folio register, SIP tracker, transactions

  Transactions     Yes                   Log new transaction + transaction history

  LTCG Harvest     Yes                   LTCG tracker + FY running status

  \+ New goal      Yes (accent style)    Opens Add New Goal wizard

  \+ Transaction   Yes (accent style)    Opens Add Transaction modal
  -----------------------------------------------------------------------------------------------—

### 2. Screen Specifications

#### Screen 0 — Login (NEW)

> **✅ NEW:** Login screen fully specified. Not in v2.

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Component**             **Content**                                                                                                                                                         **Behaviour**
  ------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------------- ----------------------------------------------------------------------------------------------------------—
  Left panel (brand)        Logo, tagline, 4 feature bullets (NAV auto-fetch, CAS import, LTCG tracker, tracking-only), legal note                                                              Static — dark forest-green background

  Right panel (auth card)   Glass card with: "Welcome back" heading, Google OAuth button (primary), email divider, email + password fields, Sign in button, "No account? Create one" link   Google button initiates Google OAuth flow. Success → Onboarding (first time) or Dashboard (returning user).

  Trust note                "Tracking only. WealthTrack never connects to your broker. No trades executed."                                                                                   Below the sign-in button — always visible
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

> ⚡ Google OAuth is the primary and recommended path. Email/password is a fallback. No password reset flow in Phase 1 — "Forgot password" deferred to Phase 2.

#### Screen 1 — Dashboard (updated)

All v2 components remain. One update: the monthly cashflow panel has two states.

> **🔄 UPDATED:** Dashboard cashflow panel is conditional on whether the user has any active SIPs.

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **State**             **Condition**            **Panel content**
  --------------------- ------------------------ -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  SIP state (default)   User has ≥1 active SIP   Monthly SIP commitment total + per-SIP rows with confirmation status badges (Confirmed / Pending / Missed)

  Lumpsum-only state    User has 0 active SIPs   Info chip: "No SIPs active — all goals funded by lumpsum" + per-goal lumpsum deployment status (deployed ₹ / needed ₹ + mini progress bar + "Fully deployed" or "₹X pending" label) + total deployed footer + "Add SIP" CTA link
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

> ⚡ The app detects which state to render automatically. No user action needed. If a user later adds a SIP, the panel switches to SIP state automatically.

#### Screen 2 — Goal Detail

Unchanged from v2. Goal type (🔥 🏫 🎓 💍 etc.) now drives the top-border accent colour of the goal card and the goal detail header.

#### Screen 3 — Add Transaction (modal)

Unchanged from v2.

#### Screen 4 — LTCG Harvest Tracker

Unchanged from v2.

#### Screen 5 — SIP Manager

Unchanged from v2.

#### Screen 6 — Add New Goal Wizard (NEW)

> **✅ NEW:** Full 3-step goal creation wizard. Not documented in v2.

Accessed from "+ New goal" in topnav or the dashed "+ New goal" card on the dashboard. Opens as a full-page flow (not a modal) with 3 steps and a step indicator at the top.

##### Step 1 — Goal type & name

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Element**        **Detail**
  ------------------ -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  Goal type grid     6 cards in 3×2 grid: FIRE 🔥, School fees 🏫, Graduation 🎓, Marriage 💍, House 🏡, Custom ✦. Tap to select (single select). Selected card shows green border + checkmark badge.

  Goal name field    Text input. Placeholder: "e.g. Reyaansh Graduation". Required.

  "For" field      Optional text input. Separate from goal name. e.g. "Reyaansh", "Kid 2", "Self". Stored as for_whom on Goal entity.
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

##### Step 2 — Target & timeline

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Element**                  **Detail**
  ---------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  Target corpus ₹              Numeric input. Form hint: "Your decision — the app never changes this." Required.

  Target year                  Numeric input (e.g. 2037). Required.

  Live indicative projection   Appears automatically when both fields are filled. Shows: Horizon (years), Lumpsum needed today at 12% CAGR, Equivalent monthly SIP at 12% CAGR. Labelled "Indicative — assumes 12% CAGR equity. Not a recommendation."

  Investment mode selector     Segmented control: Lumpsum only / SIP only / Lumpsum + SIP. Drives which fields appear in Step 3 and in subsequent transaction entry. Default: Lumpsum + SIP.
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

> ⚡ The live projection is informational only — it does not set the target. The user's typed target corpus is always the source of truth.

##### Step 3 — Funds & allocation

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Element**            **Detail**
  ---------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  Fund rows              One row per fund. Each row: fund name (dropdown) + allocation % (number) + folio number (optional text). Rows can be added and removed freely.

  Allocation validator   Live running total of all allocation % values. Displayed as a coloured status bar below the fund rows: amber with message "X% allocated — needs to reach 100%" when not 100%, green with "100% allocated ✓" when exactly 100%. Save button is disabled until total = 100%.

  Goal summary preview   Shows goal name, target ₹, target year, investment mode before saving. Confirming saves the goal and redirects to Goal Detail.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

> ⚡ A goal can be created with no funds initially (user skips fund rows) and funds added later from Goal Detail. The allocation validator only blocks save if funds are added but don't total 100%.

### 3. Design System

> **✅ NEW:** Design system documented from UI v3 reference (wealthtrack_v3.html). Implementation must match this system.

#### 3.1 Background & Atmosphere

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Element**        **Spec**
  ------------------ ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  Page background    Fixed dark forest-green mesh: radial gradients layered over linear gradient (#0F2A1C → #162F22 → #0C1F15)

  Animated orbs      3 blurred radial circles (blur: 60px) drifting slowly via CSS animation. Orb 1: 420×420px sage green, top-left. Orb 2: 320×320px forest green, bottom-right. Orb 3: 200×200px mint, centre-right. 16--22s drift cycles.

  Purpose            Orbs give the glass panels something to pick up colour from. Without a rich background, glassmorphism looks like plain white opacity. Critical for the effect.
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

#### 3.2 Glass Tiers

Three glass levels — use the right tier for the right context. Never stack blur on blur.

  -----------------------------------------------------------------------------------------------------------------------------------------------------—
  **Glass tier**   **CSS class**   **Background opacity**                  **Use case**
  ---------------- --------------- --------------------------------------- ----------------------------------------------------------------------------—
  Light glass      .glass          62% white + 18px blur + 160% saturate   Primary dashboard cards, goal cards, modals — white-tinted, dark text

  Dark glass       .glass-dark     42% white + 18px blur                   Secondary panels (SIP widget, allocation donut) — slightly more transparent

  Pine glass       .glass-pine     55% #1A3A28 + 20px blur                 Hero panels (FIRE widget) — dark green tinted, white text

  Topbar glass     .topbar         70% #0F2A1C + 20px blur                 Navigation bar — dark, stays opaque enough to read nav labels
  -----------------------------------------------------------------------------------------------------------------------------------------------------—

> ⚡ Rule: blur only on the first layer separating content from the background. Inner elements (table rows, metric boxes) use solid rgba fills — never additional blur.

#### 3.3 Colour Tokens

  -------------------------------------------------------------------------------------—
  **Token**             **Value**   **Used for**
  --------------------- ----------- ---------------------------------------------------—
  \--pine               #1A3A28     Deepest background reference

  \--forest             #2D5A40     Mid-depth background

  \--sage               #4A8060     Input focus borders, mid-tone accents

  \--mint               #7BB89A     Active nav links, live indicators, subtle highlights

  \--foam               #C8E6D4     Very light tints

  \--mist               #EEF7F2     Lightest surface backgrounds

  \--green (semantic)   #1D6B3E     On-track status, positive values, primary buttons

  \--amber (semantic)   #92530B     Monitor status, warnings, pending states

  \--red (semantic)     #8B2020     Behind status, errors

  \--blue (semantic)    #1A4A8A     Info states, SIP type badge
  -------------------------------------------------------------------------------------—

#### 3.4 Typography

  --------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Role**          **Font**             **Weight**                 **Use case**
  ----------------- -------------------- -------------------------- --------------------------------------------------------------------------------------------—
  Display / serif   Cormorant Garamond   500 (medium), 600 italic   Logo, onboarding questions, hero taglines. Italic for emphasis.

  Body / UI         DM Sans              400 regular, 500 medium    All UI text, labels, buttons, table content. Two weights only — never 600 or 700.

  Monospace         DM Mono              400, 500                   NAV values, unit counts, folio numbers, any financial number requiring fixed-width alignment.
  --------------------------------------------------------------------------------------------------------------------------------------------------------------—

#### 3.5 Goal Type Colour Coding

Each goal type has a distinct top-border accent colour on its card and a matching light background for its icon chip. Consistent across dashboard cards, goal selector chips, and transaction log badges.

  -------------------------------------------------------------------------—
  **Goal type**          **Border / accent**   **Icon bg**
  ---------------------- --------------------- ----------------------------—
  FIRE                   #1D6B3E (green)       var(\--green-l)

  School fees            #7B3FA0 (purple)      #F5EEF8

  Graduation             #C87820 (amber)       var(\--amber-l)

  Marriage (Reyaansh)    #0B5345 (teal)        var(\--green-l)

  Marriage (Kid 2)       #78281F (red)         var(\--red-l)

  White Goods / Custom   #212F3D (slate)       #EAF2FF
  -------------------------------------------------------------------------—

#### 3.6 Onboarding vs Dashboard — Two Visual Modes

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Mode**             **Background**                                  **Input style**                                                                         **Text colour**
  -------------------- ----------------------------------------------- --------------------------------------------------------------------------------------- ------------------—
  Onboarding (setup)   Dark green mesh — full visibility of orbs     Dark glass inputs: rgba(255,255,255,0.1) bg, white text, rgba(255,255,255,0.2) border   White on dark

  Dashboard (live)     Same dark mesh — but covered by glass cards   Light inputs: rgba(255,255,255,0.85) bg, dark text, rgba(74,102,84,0.2) border          Dark on light glass
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

> ⚡ The visual mode shift from onboarding to dashboard is intentional — it signals the transition from "setting up" to "using the app". The dark-to-light shift feels like walking from outside into a room.

### 4. UX Principles

All 7 principles from v2 remain. Four new principles added from UI design work.

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Principle**                                       **Implementation**
  --------------------------------------------------- -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  Show lumpsum and SIP separately, combined clearly   Goal card: "Lumpsum: ₹X | SIP: ₹Y | Total: ₹Z". Folio register: separate columns. Never blur the two into one "invested" number.

  One primary action per screen                       Add Transaction on Goal Detail. Log Harvest on LTCG. Create Goal button on dashboard. No feature overload.

  Show the "so what" always                         Never just show current value — always show progress %, gap to target, required CAGR.

  Colour-code status consistently                     Green >90%. Amber 50--90%. Red \<50%. Same everywhere — cards, badges, progress bars.

  Timestamps on all manual data                       EPF, NPS, Gold: always "last updated [date]". NAV: "as of [date]" chip in green.

  Undo always available                               Transaction delete: 10-second undo toast. Soft delete only.

  Export always accessible                            Settings → Export — Excel or CSV, always free.

  Allocation % must total exactly 100%                NEW: Live validator on Add New Goal Step 3 and on Goal Detail folio register edit. Amber warning when not 100%. Green confirm when exactly 100%. Save blocked until valid.

  Inline projections — not in settings              NEW: Indicative lumpsum/SIP projections shown during goal creation (Step 2 of wizard), not buried in settings or a separate calculator. Always labelled "indicative at 12% CAGR — not a recommendation."

  Goal type is a first-class field                    NEW: Goal type drives icon, card accent colour, default investment mode, and horizon hint. Not cosmetic — it changes the UI behaviour. Stored as an enum, not free text.

  Lumpsum-only state is a valid first-class state     NEW: Dashboard does not assume SIPs exist. If no SIPs, the cashflow panel shows lumpsum deployment status instead of SIP confirmation status. No empty state / "add a SIP" pressure.
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

---

## Document 5

## Integrations, APIs & Automation Specifications

### 1. AMFI NAV API (Core — Free, Public)

  -------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Attribute**                **Detail**
  ---------------------------- --------------------------------------------------------------------------------------------------------------------------—
  Endpoint                     https://api.mfapi.in/mf/{schemeCode} — or direct AMFI navall.txt

  Data                         All MF NAVs, updated daily after 6 PM IST

  Cost                         Free — publicly available

  Latency                      Daily — not real-time

  Lambda trigger               EventBridge cron: 0 13 \* \* ? \* (6:30 PM IST = 13:00 UTC). Fetches NAVs for all funds in DB. Stores in nav_history table.

  On-demand fetch              When user enters a transaction date → Go Lambda calls AMFI historical API for that specific date + fund

  Fallback                     Cache last known NAV. Never show zero or error — always show "NAV as of [date]"

  Weekend / holiday handling   AMFI skips non-trading days. Fetch prev business day NAV. Show note to user.
  -------------------------------------------------------------------------------------------------------------------------------------------------------—

### 2. CAS Import

  ---------------------------------------------------------------------------------------------------------------------------—
  **Attribute**      **Detail**
  ------------------ --------------------------------------------------------------------------------------------------------—
  What it provides   Full transaction history, all folio numbers, fund names, avg cost, current units — all AMCs in one file

  How user gets it   Email cas@camsonline.com or mystatement@kfintech.com — PDF arrives with PAN as password

  Upload flow        User uploads PDF → Go Lambda calls pdf parser → extracts text → regex parser → structured transactions

  Parser             Go PDF parser (pdfcpu or unipdf library) + custom regex. Separate parsers for CAMS and KFintech formats.

  Robustness         Test against 20+ real CAS samples before shipping. Handle encoding variations.

  Frequency          One-time onboarding. Re-upload any time to sync new transactions.

  Does NOT cover     NPS, EPF, direct equity, gold — these stay manual
  ---------------------------------------------------------------------------------------------------------------------------—

### 3. Notification Infrastructure

> **🔄 UPDATED:** FCM replaced with SES email + in-app notifications (web app — no native push). Browser push notifications for PWA users (optional, requires permission).

  ------------------------------------------------------------------------------------------------------------------------------—
  **Notification**           **Trigger logic**                                                  **Channel**
  -------------------------- ------------------------------------------------------------------ --------------------------------—
  LTCG harvest window        EventBridge: Feb 1. Check user has LTCG > ₹10,000. Send if yes.   SES email + in-app banner

  Glide path alert           Daily Lambda: (target_year − current_year) ≤ 3 AND not sent        SES email + in-app banner

  Monthly update reminder    EventBridge: 1st of month                                          In-app only (dismissible)

  Annual review              EventBridge: April 1                                               SES email + in-app

  SIP confirmation pending   Daily Lambda: SIP date reached, txn not confirmed within 5 days    In-app badge

  STP ending soon            Daily Lambda: stp_end_date − today ≤ 30                            In-app banner

  Goal behind track          Daily Lambda: progress% \< 40% of expected                         In-app only — no email for this
  ------------------------------------------------------------------------------------------------------------------------------—

---

## Document 6

## Technical Architecture & Implementation Plan

### 1. Recommended Tech Stack

> **🔄 UPDATED:** Backend: Go (not Node.js). Runtime: AWS Lambda (serverless, not always-on). Database: Neon serverless Postgres (recommended) — see DB decision below.

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Layer**            **Technology**                           **Rationale**
  -------------------- ---------------------------------------- ------------------------------------------------------------------------------------------------------------------—
  Frontend             React + TypeScript + Vite                Web app first. Mobile-responsive. PWA for home screen install.

  UI components        shadcn/ui + Tailwind CSS                 Clean, accessible, customisable. No heavyweight library.

  State management     TanStack Query (React Query)             Server state, caching, background refresh. Perfect for financial data.

  Charts               Recharts or Tremor                       Lightweight. Recharts for flexibility; Tremor for fast dashboard components.

  Backend language     Go (Golang)                              Fast cold starts (critical for Lambda). Excellent for financial arithmetic. Strong concurrency for NAV batch fetch.

  Backend framework    AWS Lambda + API Gateway                 Serverless. No idle cost. Scales to zero. Go binary = fast cold start (\~50ms).

  Authentication       AWS Cognito + Google OAuth               Managed auth. Google login only — no password storage. Free tier: 50,000 MAU.

  Database             Neon Serverless Postgres (recommended)   See DB decision section below. Free tier is genuinely live-app capable.

  NAV data store       Neon Postgres — nav_history table      Queryable by date range. Simple SQL joins with transactions.

  File storage         AWS S3                                   CAS PDF uploads. Encrypted at rest. Free tier: 5GB.

  Email                AWS SES                                  LTCG alerts, annual review. Free tier: 3,000 emails/month — more than enough.

  Cron / Scheduling    AWS EventBridge Scheduler                Triggers Lambda for daily NAV fetch, monthly SIP entries, annual alerts. Free tier covers it.

  Hosting (frontend)   AWS Amplify or Vercel                    Amplify if staying in AWS ecosystem. Vercel for simpler deployment. Both free tier for personal use.

  Monitoring           AWS CloudWatch + Sentry (frontend)       Lambda logs in CloudWatch. Frontend errors in Sentry free tier.

  IaC                  AWS CDK (TypeScript)                     Define all Lambda + API Gateway + EventBridge + S3 as code. Reproducible.
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

### 2. Database Decision — Detailed Analysis

**The problem with Supabase free tier**

Supabase free tier pauses the database after 7 days of inactivity. First request after pause takes 20--30 seconds to resume. Unacceptable for a live app.

#### Option A — Neon Serverless Postgres (RECOMMENDED)

+----------------------------------------------------------------------------------------------------------------------------------------+
| **Why Neon wins for this use case:**                                                                                                   |
|                                                                                                                                        |
| • Free tier: 0.5 GB storage, 190 compute hours/month — enough for a personal tracker with years of transaction history               |
|                                                                                                                                        |
| • Autoscales to zero (no idle cost) but cold start is 500ms--1s — much better than Supabase 20-30 seconds                            |
|                                                                                                                                        |
| • Full PostgreSQL — all SQL, indexes, joins, ACID transactions work exactly as expected                                              |
|                                                                                                                                        |
| • Branching: create a dev branch of your DB — test migrations without touching production data                                       |
|                                                                                                                                        |
| • Connection pooling built in — Lambda connections handled via Neon's serverless driver (HTTP-based, no connection pool exhaustion) |
|                                                                                                                                        |
| • No pausing — unlike Supabase, Neon free tier does not pause your database                                                          |
|                                                                                                                                        |
| • go-neon or standard pgx driver in Go — well-supported                                                                              |
|                                                                                                                                        |
| • Verdict: Use Neon. It is the right call for relational financial data on a free tier that actually works.                            |
+----------------------------------------------------------------------------------------------------------------------------------------+

#### Option B — DynamoDB (if you want pure AWS + NoSQL)

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **DynamoDB free tier and trade-offs:**                                                                                                                                                        |
|                                                                                                                                                                                               |
| • Free tier: 25 GB storage + 25 WCU + 25 RCU permanently — never expires (unlike most free tiers)                                                                                           |
|                                                                                                                                                                                               |
| • On-demand mode after free tier: pay per request — \~\$1.25 per million reads/writes. Personal tracker = near-zero cost.                                                                   |
|                                                                                                                                                                                               |
| • No cold start — DynamoDB is always on. Latency is single-digit milliseconds.                                                                                                              |
|                                                                                                                                                                                               |
| • Stays entirely within AWS ecosystem — Lambda + DynamoDB + S3 + Cognito + SES + EventBridge = one bill, one IAM, one console                                                               |
|                                                                                                                                                                                               |
| • TRADE-OFF: No SQL. Queries need careful table design. FIFO LTCG calculation (multi-tranche sort by date) is harder without SQL — needs a GSI (Global Secondary Index) on folio_id + date. |
|                                                                                                                                                                                               |
| • TRADE-OFF: No ad-hoc queries. You must know your access patterns upfront and design the table around them.                                                                                  |
|                                                                                                                                                                                               |
| • TRADE-OFF: Joins don't exist — you aggregate in application code, not DB. Slightly more Go code.                                                                                         |
|                                                                                                                                                                                               |
| • Verdict: Valid choice if you want 100% AWS and are comfortable with NoSQL data modeling. The FIFO LTCG logic is the hardest part to get right without SQL.                                  |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

#### Option C — PlanetScale (MySQL serverless) — Mentioned for completeness

PlanetScale removed their free tier in 2024. Not recommended.

#### Option D — Turso (SQLite at the edge)

+-----------------------------------------------------------------------------------------------------------------------------------------------------+
| **Turso consideration:**                                                                                                                            |
|                                                                                                                                                     |
| • Free tier: 500 databases, 9 GB storage, 1 billion row reads/month — extremely generous                                                          |
|                                                                                                                                                     |
| • SQLite at the edge — very fast reads close to user                                                                                              |
|                                                                                                                                                     |
| • Good Go driver (go-libsql)                                                                                                                        |
|                                                                                                                                                     |
| • TRADE-OFF: SQLite has weaker consistency guarantees than Postgres for concurrent writes. For a single-user personal tracker this is not an issue. |
|                                                                                                                                                     |
| • TRADE-OFF: Less familiar than Postgres for financial query patterns. FIFO requires careful window function usage.                                 |
|                                                                                                                                                     |
| • Verdict: Viable for a personal tracker. Choose over DynamoDB if you want SQL syntax but prefer not to run Neon.                                   |
+-----------------------------------------------------------------------------------------------------------------------------------------------------+

**Final Recommendation**

  ----------------------------------------------------------------------------------------------------------------------------------------------------—
  **Scenario**                                       **Recommended DB**                **Why**
  -------------------------------------------------- --------------------------------- ---------------------------------------------------------------—
  Want SQL, stay lean, best free tier for live app   Neon Serverless Postgres          No pausing, full SQL, branching, serverless driver for Lambda

  Want everything in AWS, comfortable with NoSQL     DynamoDB (on-demand)              Permanent free tier, zero cold start, same AWS account as Lambda

  Want SQL, want to stay 100% in AWS                 Aurora Serverless v2 (Postgres)   More expensive but fully managed. Overkill for personal use.

  Want SQLite syntax, ultra-generous free tier       Turso                             Good choice if Neon pricing ever becomes a concern at scale
  ----------------------------------------------------------------------------------------------------------------------------------------------------—

> ⚡ All documents in this PRD use relational terminology (tables, foreign keys, SQL). The data model maps cleanly to both Neon Postgres and DynamoDB — choose either without changing the entity structure.

### 3. Serverless Architecture — How It Works

**Lambda function map**

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Lambda Function**     **Trigger**                                  **What it does**
  ----------------------- -------------------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------—
  api-\*                  API Gateway HTTP                             All CRUD operations — user, goal, folio, transaction, asset, harvest. One handler per resource using Go router (chi or gorilla/mux compiled into Lambda).

  nav-daily-fetch         EventBridge cron 6:30 PM IST                 Fetches today's NAVs for all funds in DB from AMFI. Upserts nav_history table.

  nav-on-demand           API Gateway (called when txn date entered)   Fetches historical NAV for specific fund + date from AMFI. Returns to frontend.

  sip-pending-generator   EventBridge cron 1st of month                Creates pending SIP transactions for all active SIPs. Status = SIP_PENDING.

  ltcg-alert              EventBridge cron Feb 1                       Calculates LTCG per user. Sends SES email if LTCG > ₹10,000.

  glide-path-check        EventBridge cron daily                       Checks if any goal is T-3 years. Sends alert if not already sent.

  cas-parser              S3 event on PDF upload                       Triggered by CAS PDF upload to S3. Parses PDF. Writes transactions to DB. Calls frontend webhook on complete.
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

**Go Lambda — why Go is the right choice here**

  ---------------------------------------------------------------------------------------------------------------------------------------—
  **Concern**                 **Go answer**
  --------------------------- -----------------------------------------------------------------------------------------------------------—
  Cold start                  Go binary cold start: 50--200ms. Node.js: 500ms--2s. Python: 300ms--1s. Go wins clearly.

  Financial arithmetic        Go has no automatic type coercion. Integer arithmetic is explicit. Less risk of float rounding bugs than JS.

  FIFO LTCG logic             Go slices + sorting is clean and explicit. Easy to unit test each FIFO tranche calculation.

  Concurrency for NAV fetch   Goroutines: fetch all fund NAVs in parallel. A 200-fund batch completes in \~1 second instead of 30.

  Binary size / cold start    Single statically-linked binary. No node_modules directory. \~10MB binary vs 50MB+ Node.js zip.

  AWS SDK                     aws-sdk-go-v2 — first-class support for all AWS services used here.
  ---------------------------------------------------------------------------------------------------------------------------------------—

### 4. Build Phases

#### Phase 1 — Core Tracker (6--8 weeks)

Goal: Working web app where a user can track all MF investments against goals — lumpsum and SIP separately.

  -------------------------------------------------------------------------------------------------------—
  **\#**   **Feature**                                                          **Complexity**
  -------- -------------------------------------------------------------------- -------------------------—
  1        AWS CDK setup: Lambda + API Gateway + Cognito + S3 + Neon Postgres   Medium

  2        React frontend scaffold: auth flow, routing, shadcn/ui components    Medium

  3        User profile + goal creation                                         Low

  4        Manual folio entry + fund-to-goal assignment + allocation %          Low

  5        Manual transaction entry (lumpsum + SIP types)                       Low

  6        AMFI NAV daily fetch Lambda + nav_history table                      Low

  7        NAV auto-fill on transaction date (on-demand Lambda)                 Medium

  8        Units auto-calculation frontend                                      Low

  9        Goal summary panel — all metrics including SIP vs lumpsum split    Medium

  10       SIP schedule setup + pending SIP generator Lambda                    Medium

  11       Dashboard with goal cards, net worth, monthly SIP total              Medium

  12       LTCG FIFO calculation + basic harvest tracker                        High
  -------------------------------------------------------------------------------------------------------—

> ⚡ End of Phase 1: replaces Excel tracker completely. Lumpsum + SIP both tracked per goal.

#### Phase 2 — Import & Automation (4--6 weeks)

  ----------------------------------------------------------------------------------------—
  **\#**   **Feature**                                           **Complexity**
  -------- ----------------------------------------------------- -------------------------—
  1        CAS PDF parser Lambda (Go + pdfcpu)                   High

  2        Transaction backfill from CAS import                  Medium

  3        Non-MF asset tracking (EPF, NPS, Gold, Equity)        Medium

  4        Gold spot price semi-auto (MCX fetch + confirm)       Medium

  5        Full LTCG harvest tracker screen + harvest log flow   Medium

  6        All 8 alert types (SES + in-app)                      Medium

  7        Asset allocation donut chart                          Low

  8        SIP health dashboard + step-up history                Medium

  9        Data export to Excel/CSV                              Medium

  10       Glide path alert logic                                Low
  ----------------------------------------------------------------------------------------—

> ⚡ End of Phase 2: full feature parity with Excel tracker plus significant automation beyond it.

#### Phase 3 — Polish (3--4 weeks)

  -----------------------------------------------------------------------------------------------------—
  **\#**   **Feature**                                                        **Complexity**
  -------- ------------------------------------------------------------------ -------------------------—
  1        FIRE projection chart (monthly corpus growth curve)                Medium

  2        Portfolio performance vs Nifty 500 benchmark                       Medium

  3        PWA: installable on mobile home screen, offline last-synced view   Medium

  4        STP auto-logging from schedule                                     Low

  5        Direct equity live price integration (NSE)                         Medium

  6        SIP step-up reminder (April 1 annual email)                        Low
  -----------------------------------------------------------------------------------------------------—

### 5. Critical Implementation Notes

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Area**                            **Note**
  ----------------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  FIFO for LTCG                       Redemptions consume oldest units first. In Go: sort transactions by date ASC, iterate and consume. Write unit tests for each case: partial redemption, full redemption, multiple tranches. This is the most complex calculation in the app.

  NAV date handling                   AMFI skips weekends and market holidays. Lambda: if no NAV for requested date, fetch most recent previous date. Return both the NAV and the actual date so frontend can show "NAV from [prev business day]".

  SIP vs lumpsum must stay separate   Never merge SIP and lumpsum amounts in storage or calculation. Users need to see both independently. BUY_SIP and BUY_LUMPSUM are distinct transaction types.

  CAS parser — test extensively     Build separate parsers for CAMS and KFintech CAS formats. Test with 20+ real files. Edge cases: folios with no transactions in the period, dividend reinvestment entries, switch transactions.

  Indian FY everywhere                FY = April 1 to March 31. LTCG tracker, annual reset, all FY-labelled data. Use a helper function: getIndianFY(date) → "2025-26". Never use calendar year for LTCG.

  Integer arithmetic for money        Store all ₹ amounts as int64 in paise (₹1 = 100 paise). NAV stored as int64 in paise × 1000 (to preserve 3 decimal places). Never use float64 for money in Go.

  Lambda connection to Neon           Use Neon's serverless HTTP driver (not standard TCP postgres connection) to avoid connection exhaustion across Lambda instances. Neon provides a Go HTTP driver for this.

  Goal target is user-owned           Never suggest, auto-calculate, or change the goal target. It is always a yellow (editable) input field. The app shows Required CAGR and progress against the target — never questions the target itself.

  No execution capability             App connects to AMFI API read-only and S3 for CAS uploads. No brokerage API, no trade routing. Regulatory and trust requirement.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

---

## Document 7

## Acceptance Criteria & Definition of Done

### 1. Phase 1 — Done when:

  -----------------------------------------------------------------------------------------------------------------------------------—
  **Criterion**                        **Test**
  ------------------------------------ ----------------------------------------------------------------------------------------------—
  NAV auto-fetches daily               At 7 PM IST, all MF folios show today's NAV — no user action

  NAV fills on transaction date        Enter date Feb 15 → NAV fills with Feb 15 AMFI NAV within 2 sec

  Units auto-calculate                 ₹50,000 amount + NAV 45.50 → units shows 1098.901

  Lumpsum and SIP tracked separately   Goal detail shows: Lumpsum invested ₹X | SIP invested ₹Y | Total ₹Z — independently correct

  SIP pending entry generated          1st of month → pending SIP entries created for all active SIPs automatically

  SIP confirmation flow                User confirms pending SIP → transaction recorded, units calculated, goal progress updates

  Goal progress accurate               With known transactions and NAV, progress % matches manual Excel calculation exactly

  LTCG flag correct                    Txn 366 days ago = LTCG. Txn 364 days ago = STCG.

  FIFO correct                         3 buy tranches, partial redemption → oldest tranche consumed first. Unit test passes.

  Dashboard loads \<2 sec              On standard broadband, home screen with 8 goals loads in \<2 seconds

  Transaction entry \<30 sec           From clicking + to confirming a Buy: under 30 seconds
  -----------------------------------------------------------------------------------------------------------------------------------—

### 2. Phase 2 — Done when:

  ---------------------------------------------------------------------------------------------------------------------------------------—
  **Criterion**                    **Test**
  -------------------------------- ------------------------------------------------------------------------------------------------------—
  CAS import populates correctly   Upload real CAS PDF → all folios + all transactions appear. Cross-check 5 transactions vs CAS manually.

  SIP history preserved via CAS    Historical SIP transactions imported from CAS are tagged BUY_SIP not BUY_LUMPSUM

  EPF / NPS tracked                EPF balance entered → appears in net worth with last-updated timestamp

  LTCG calculation correct         Known transactions + current NAV → LTCG per folio matches manual FIFO calculation

  FY limit correct                 After logging ₹80,000 harvest → remaining shows ₹45,000

  LTCG alert fires Feb 1           Set system date to Feb 1 → alert email sent + in-app banner appears

  Export works                     Export to Excel → open file → all transactions present, SIP vs lumpsum correctly labelled
  ---------------------------------------------------------------------------------------------------------------------------------------—

### 3. Always-True Invariants

-   App never shows stale NAV without a timestamp indicating when it was last fetched

-   App never executes or initiates any trade, order, or payment

-   Lumpsum invested and SIP invested are always stored and displayed separately

-   Goal target corpus is never auto-set or auto-changed — always user-owned

-   LTCG FY resets automatically on April 1 — no manual action needed

-   All user data is exportable in full at any time in a standard format

-   Transaction delete shows 10-second undo toast — soft delete only

-   All monetary storage uses integer paise arithmetic — no floating point for money

-   Lambda functions are stateless — all state lives in the database, not in Lambda memory

-   Offline / Lambda down: frontend shows last-synced data clearly labelled — never crashes

### 4. Out of Scope — Explicitly

+----------------------------------------------------------------------------------------------+
| **The following are explicitly excluded:**                                                   |
|                                                                                              |
| • Fund recommendations or buy/sell advice of any kind                                        |
|                                                                                              |
| • Tax filing or ITR generation                                                               |
|                                                                                              |
| • Trade execution — no connection to broker order management                               |
|                                                                                              |
| • Mobile native app (iOS/Android) — web PWA covers mobile use case in Phase 3              |
|                                                                                              |
| • Multi-user / family portfolio (separate product consideration)                             |
|                                                                                              |
| • Loan / EMI tracking                                                                        |
|                                                                                              |
| • Insurance tracking                                                                         |
|                                                                                              |
| • Cryptocurrency tracking                                                                    |
|                                                                                              |
| • International investments outside India (PPFAS foreign holding tracked as part of MF only) |
|                                                                                              |
| • Benchmark comparison / performance attribution (Phase 3 consideration only)                |
+----------------------------------------------------------------------------------------------+

**End of Pre-Implementation Documentation — WealthTrack v2.0**

*Go + AWS Lambda + Neon Postgres + React | Ready for Implementation*


---

### New criteria added in v3 (UI-driven)

## Acceptance Criteria Updates

> **🔄 UPDATED:** 5 new acceptance criteria added for flows introduced in UI v3. All criteria from v2 remain valid.

**New Criteria — Phase 1**

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  **Criterion**                              **Test**
  ------------------------------------------ ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—
  Onboarding wizard completes end-to-end     New user signs in → completes all 9 steps → dashboard populates with entered data, correct NAVs, correct goal progress calculations. Zero manual steps required after Step 9.

  Lumpsum-only dashboard renders correctly   Create a user with goals but 0 SIP transactions → dashboard shows lumpsum deployment status panel, not SIP confirmation panel. Add 1 SIP transaction → panel switches to SIP state automatically without page refresh.

  Add New Goal wizard saves correctly        Complete 3-step wizard → goal appears in Goals list → goal detail shows correct target, year, fund allocation, investment mode. Folio register shows all entered funds at correct allocation %.

  Allocation validator blocks invalid save   In Step 3 of Add New Goal wizard: add 2 funds at 40% + 40% = 80% → save button is disabled, amber warning shows "80% allocated — needs to reach 100%". Change second fund to 60% → total = 100% → save button enables, green confirmation shows.

  Goal type drives correct UI                Create a FIRE goal → card shows green top border. Create a Graduation goal → card shows amber top border. Create a Marriage goal → card shows correct colour. Goal type icon appears in card header and goal detail heading.
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------—

**Updated Invariants**

All 8 invariants from v2 remain. Two new invariants added:

-   Dashboard cashflow panel always reflects the current SIP state — never shows SIP panel with 0 SIPs, never shows lumpsum panel when SIPs exist

-   Goal type is immutable after creation — changing a FIRE goal to a Marriage goal is not allowed (would break colour coding, default behaviours, and historical context). User must delete and recreate.

**End of v3 Updates — WealthTrack Pre-Implementation Documentation**

*v3 covers UI-driven changes only. Combine with wealthtrack_prd_v2.docx for complete spec.*