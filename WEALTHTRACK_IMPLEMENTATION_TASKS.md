# WealthTrack — Implementation Task Document

**Version:** 1.0  
**Date:** March 2026  
**Platform:** Web App (React + TypeScript + Vite)  
**Backend:** Go + AWS Lambda (Serverless)  
**Database:** Neon Serverless Postgres  

---

## Overview

WealthTrack is a personal investment portfolio tracking application for Indian retail investors. It will be built alongside the existing FireCal (FIRE calculator) and Tax Harvesting Calculator in the same project.

### Key Addition to Existing App
- **Login Button** on the current landing page
- Clicking it opens the **Login Screen**
- After login, user flows into the **WealthTrack Dashboard** as defined in the PRD

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Vite |
| UI Library | shadcn/ui + Tailwind CSS |
| State Management | TanStack Query (React Query) |
| Charts | Recharts |
| Backend | Go 1.22+ |
| Runtime | AWS Lambda + API Gateway |
| Auth | AWS Cognito + Google OAuth |
| Database | Neon Serverless Postgres |
| File Storage | AWS S3 |
| Email | AWS SES |
| Cron/Scheduler | AWS EventBridge |
| IaC | AWS CDK (TypeScript) |

---

## Database Schema

### 1. Users Table
-- =============================================================================
-- WealthTrack — Complete Database Schema
-- Version: 1.0 | March 2026
-- Database: PostgreSQL (Neon Serverless recommended)
-- Run this file once on a fresh database to create the complete schema.
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USERS
-- =============================================================================
CREATE TABLE users (
    user_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    age                 INTEGER CHECK (age > 0 AND age < 120),
    monthly_expense     BIGINT,                         -- paise (₹1 = 100 paise)
    fire_target_age     INTEGER CHECK (fire_target_age > 0 AND fire_target_age < 120),
    swr_rate            DECIMAL(6,4) DEFAULT 0.0275,    -- e.g. 0.0275 = 2.75%
    inflation_rate      DECIMAL(6,4) DEFAULT 0.0600,    -- e.g. 0.06 = 6%
    onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE, -- FALSE until step 9 done
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- =============================================================================
-- 2. GOALS
-- =============================================================================
CREATE TABLE goals (
    goal_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    for_whom            VARCHAR(255),                   -- "Kid1", "Kid2", "Self"
    type                VARCHAR(50) NOT NULL,
    investment_mode     VARCHAR(20) NOT NULL DEFAULT 'LUMPSUM_AND_SIP'
                        CHECK (investment_mode IN (
                            'LUMPSUM_ONLY', 'SIP_ONLY', 'LUMPSUM_AND_SIP'
                        )),
    target_corpus       BIGINT NOT NULL,                -- paise
    target_year         INTEGER NOT NULL CHECK (target_year >= 2020 AND target_year <= 2100),
    -- horizon_years is computed at query time (target_year - current year)
    -- not stored as it would go stale — compute in application or use a view
    notes               TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);

-- =============================================================================
-- 3. FUNDS  (master data — shared across all users, populated from AMFI)
-- =============================================================================
CREATE TABLE funds (
    fund_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amfi_code           VARCHAR(50) UNIQUE NOT NULL,    -- AMFI scheme code — used for NAV fetch
    name                VARCHAR(500) NOT NULL,
    amc                 VARCHAR(255) NOT NULL,
    category            VARCHAR(50)
                        CHECK (category IN (
                            'LARGE_CAP_INDEX', 'FLEXI_CAP', 'MID_CAP_INDEX',
                            'SMALL_CAP', 'DEBT_SHORT', 'DEBT_LIQUID', 'HYBRID'
                        )),
    isin                VARCHAR(20),                    -- ISIN for direct plan
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,  -- FALSE if fund merged/wound up
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_funds_amfi_code ON funds(amfi_code);
CREATE INDEX idx_funds_name      ON funds USING gin(to_tsvector('english', name)); -- full-text search

-- =============================================================================
-- 4. FOLIOS  (one row per fund per goal per user)
-- =============================================================================
CREATE TABLE folios (
    folio_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    goal_id             UUID NOT NULL REFERENCES goals(goal_id) ON DELETE CASCADE,
    fund_id             UUID NOT NULL REFERENCES funds(fund_id),
    folio_number        VARCHAR(100),                   -- nullable: CAS import fills later
    allocation_pct      DECIMAL(5,4) NOT NULL           -- 0.25 = 25%; all folios per goal must sum to 1.0
                        CHECK (allocation_pct > 0 AND allocation_pct <= 1),

    -- SIP configuration
    sip_active          BOOLEAN NOT NULL DEFAULT FALSE,
    sip_amount          BIGINT,                         -- paise; current active amount
    sip_frequency       VARCHAR(20) DEFAULT 'MONTHLY'
                        CHECK (sip_frequency IN ('MONTHLY', 'QUARTERLY')),
    sip_start_date      DATE,
    sip_end_date        DATE,                           -- NULL = ongoing

    -- STP configuration (Systematic Transfer Plan)
    stp_active          BOOLEAN NOT NULL DEFAULT FALSE,
    stp_amount          BIGINT,                         -- paise
    stp_source_folio_id UUID REFERENCES folios(folio_id), -- where STP draws from
    stp_start_date      DATE,
    stp_end_date        DATE,

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Each fund can only appear once per goal per user
    UNIQUE (user_id, goal_id, fund_id)
);

CREATE INDEX idx_folios_user_id  ON folios(user_id);
CREATE INDEX idx_folios_goal_id  ON folios(goal_id);
CREATE INDEX idx_folios_fund_id  ON folios(fund_id);

-- =============================================================================
-- 5. SIP HISTORY  (step-up tracking — one row per amount change)
-- =============================================================================
CREATE TABLE sip_history (
    sip_history_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio_id            UUID NOT NULL REFERENCES folios(folio_id) ON DELETE CASCADE,
    amount              BIGINT NOT NULL,                -- paise
    effective_from      DATE NOT NULL,
    effective_to        DATE,                           -- NULL = currently active
    reason              VARCHAR(255),                   -- "Annual step-up", "Initial setup"
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sip_history_folio_id ON sip_history(folio_id);

-- =============================================================================
-- 6. TRANSACTIONS
-- Soft delete: deleted_at IS NULL = active, NOT NULL = deleted
-- =============================================================================
CREATE TABLE transactions (
    txn_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio_id            UUID NOT NULL REFERENCES folios(folio_id) ON DELETE CASCADE,
    txn_date            DATE NOT NULL,
    type                VARCHAR(30) NOT NULL
                        CHECK (type IN (
                            'BUY_LUMPSUM', 'BUY_SIP', 'BUY_STP',
                            'REDEEM', 'SWITCH_IN', 'SWITCH_OUT', 'DIVIDEND'
                        )),
    amount              BIGINT NOT NULL,                -- paise (always positive)
    nav                 BIGINT NOT NULL,                -- paise × 1000 (3dp precision: ₹86.451 = 86451)
    units               DECIMAL(18,6) NOT NULL,        -- auto-calculated = amount / nav * 1000
    source              VARCHAR(30) NOT NULL DEFAULT 'MANUAL'
                        CHECK (source IN (
                            'MANUAL', 'CAS_IMPORT', 'SIP_PENDING', 'SIP_CONFIRMED'
                        )),
    notes               TEXT,
    deleted_at          TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL = active (soft delete)
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_folio_id  ON transactions(folio_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_txn_date  ON transactions(txn_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_type      ON transactions(type)     WHERE deleted_at IS NULL;
-- Index for FIFO LTCG calculation (oldest-first per folio)
CREATE INDEX idx_transactions_fifo      ON transactions(folio_id, txn_date ASC) WHERE deleted_at IS NULL AND type LIKE 'BUY%';

-- =============================================================================
-- 7. NAV HISTORY  (daily NAV cache from AMFI — composite PK)
-- =============================================================================
CREATE TABLE nav_history (
    fund_id             UUID NOT NULL REFERENCES funds(fund_id) ON DELETE CASCADE,
    nav_date            DATE NOT NULL,
    nav                 BIGINT NOT NULL,                -- paise × 1000 (3dp)
    source              VARCHAR(30) NOT NULL DEFAULT 'AMFI_DAILY'
                        CHECK (source IN ('AMFI_DAILY', 'AMFI_HISTORICAL', 'MANUAL')),
    PRIMARY KEY (fund_id, nav_date)
);

CREATE INDEX idx_nav_history_fund_date ON nav_history(fund_id, nav_date DESC);

-- =============================================================================
-- 8. NON-MF ASSETS  (EPF, NPS, Gold, Silver, Direct Equity, FD, Emergency Fund)
-- =============================================================================
CREATE TABLE non_mf_assets (
    asset_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    goal_id             UUID REFERENCES goals(goal_id) ON DELETE SET NULL, -- nullable: EPF/NPS not goal-specific
    type                VARCHAR(30) NOT NULL
                        CHECK (type IN (
                            'EPF', 'NPS', 'GOLD', 'SILVER',
                            'DIRECT_EQUITY', 'FD', 'EMERGENCY_FUND'
                        )),
    name                VARCHAR(255) NOT NULL,          -- "EPF - Infosys", "SGB 2023-24 Series I"
    current_value       BIGINT NOT NULL,                -- paise; manually updated
    invested_value      BIGINT,                         -- paise; original cost basis
    quantity            DECIMAL(15,6),                  -- grams for Gold/Silver; units for equity
    monthly_contribution BIGINT,                        -- paise; for EPF/NPS employer+self contribution
    notes               TEXT,                           -- lock-in date, maturity date, PRAN, UAN etc.
    last_updated        DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_non_mf_assets_user_id ON non_mf_assets(user_id);

-- =============================================================================
-- 9. LTCG HARVEST RECORDS
-- =============================================================================
CREATE TABLE ltcg_harvest_records (
    harvest_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    financial_year          VARCHAR(10) NOT NULL,       -- "2025-26"
    harvest_date            DATE NOT NULL,
    folio_id                UUID NOT NULL REFERENCES folios(folio_id),
    units_redeemed          DECIMAL(18,6) NOT NULL,
    cost_basis              BIGINT NOT NULL,            -- paise; FIFO-calculated avg cost
    redemption_value        BIGINT NOT NULL,            -- paise
    ltcg_crystallised       BIGINT NOT NULL,            -- paise; redemption_value - cost_basis
    tax_payable             BIGINT NOT NULL DEFAULT 0,  -- paise; MAX(0, cumulative_fy - 125000) * 0.125
    reinvested_into_folio_id UUID REFERENCES folios(folio_id),
    reinvestment_date       DATE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ltcg_user_fy    ON ltcg_harvest_records(user_id, financial_year);
CREATE INDEX idx_ltcg_folio_id   ON ltcg_harvest_records(folio_id);

-- =============================================================================
-- 10. USER SESSIONS  (auth — JWT refresh token tracking)
-- =============================================================================
CREATE TABLE user_sessions (
    session_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    refresh_token_hash  VARCHAR(255) NOT NULL,          -- bcrypt hash of refresh token
    device_info         VARCHAR(500),                   -- browser + OS for display in settings
    ip_address          INET,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at          TIMESTAMP WITH TIME ZONE DEFAULT NULL -- NULL = active
);

CREATE INDEX idx_sessions_user_id     ON user_sessions(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_sessions_token_hash  ON user_sessions(refresh_token_hash);
CREATE INDEX idx_sessions_expires     ON user_sessions(expires_at) WHERE revoked_at IS NULL;

-- =============================================================================
-- 11. CAS IMPORT LOG  (track import history for debugging + re-import detection)
-- =============================================================================
CREATE TABLE cas_imports (
    import_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    filename            VARCHAR(500),
    source              VARCHAR(20) NOT NULL
                        CHECK (source IN ('CAMS', 'KFINTECH')),
    status              VARCHAR(20) NOT NULL DEFAULT 'PROCESSING'
                        CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
    folios_found        INTEGER DEFAULT 0,
    transactions_imported INTEGER DEFAULT 0,
    error_message       TEXT,                           -- populated if status = FAILED
    started_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_cas_imports_user_id ON cas_imports(user_id);

-- =============================================================================
-- 12. ALERT PREFERENCES  (per-user alert opt-in/out)
-- =============================================================================
CREATE TABLE alert_preferences (
    user_id             UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    ltcg_harvest_alert  BOOLEAN NOT NULL DEFAULT TRUE,
    glide_path_alert    BOOLEAN NOT NULL DEFAULT TRUE,
    monthly_update_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    annual_review_alert BOOLEAN NOT NULL DEFAULT TRUE,
    sip_pending_alert   BOOLEAN NOT NULL DEFAULT TRUE,
    stp_ending_alert    BOOLEAN NOT NULL DEFAULT TRUE,
    sip_stepup_reminder BOOLEAN NOT NULL DEFAULT FALSE, -- opt-in only
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- VIEWS — computed fields that are always derived, never stored
-- =============================================================================

-- Horizon years per goal (recomputed each query)
CREATE VIEW goal_horizon AS
    SELECT
        goal_id,
        user_id,
        name,
        type,
        target_year,
        target_year - EXTRACT(YEAR FROM NOW())::INTEGER AS horizon_years
    FROM goals;

-- Current FY helper (India FY: Apr 1 – Mar 31)
CREATE VIEW current_indian_fy AS
    SELECT
        CASE
            WHEN EXTRACT(MONTH FROM NOW()) >= 4
            THEN EXTRACT(YEAR FROM NOW())::INTEGER
            ELSE EXTRACT(YEAR FROM NOW())::INTEGER - 1
        END AS fy_start_year,
        CASE
            WHEN EXTRACT(MONTH FROM NOW()) >= 4
            THEN (EXTRACT(YEAR FROM NOW())::INTEGER + 1)::TEXT
            ELSE EXTRACT(YEAR FROM NOW())::TEXT
        END || '-' ||
        CASE
            WHEN EXTRACT(MONTH FROM NOW()) >= 4
            THEN RIGHT((EXTRACT(YEAR FROM NOW())::INTEGER + 1)::TEXT, 2)
            ELSE RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2)
        END AS financial_year;

-- Active transactions only (excludes soft-deleted)
CREATE VIEW active_transactions AS
    SELECT * FROM transactions WHERE deleted_at IS NULL;

-- Latest NAV per fund
CREATE VIEW latest_nav AS
    SELECT DISTINCT ON (fund_id)
        fund_id,
        nav_date,
        nav
    FROM nav_history
    ORDER BY fund_id, nav_date DESC;

-- LTCG crystallised per user per FY
CREATE VIEW ltcg_fy_summary AS
    SELECT
        user_id,
        financial_year,
        SUM(ltcg_crystallised)  AS total_ltcg_crystallised,
        SUM(tax_payable)        AS total_tax_payable,
        125000000 - SUM(ltcg_crystallised) AS remaining_limit_paise -- ₹1,25,000 in paise
    FROM ltcg_harvest_records
    GROUP BY user_id, financial_year;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to all tables with updated_at
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_goals
    BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_funds
    BEFORE UPDATE ON funds
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_folios
    BEFORE UPDATE ON folios
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_transactions
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_non_mf_assets
    BEFORE UPDATE ON non_mf_assets
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Ensures users can only read/write their own data.
-- Set app.current_user_id via: SET app.current_user_id = '<uuid>';
-- Your Go Lambda must set this on every connection before executing queries.
-- =============================================================================

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE folios             ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_mf_assets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ltcg_harvest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cas_imports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_preferences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sip_history        ENABLE ROW LEVEL SECURITY;

-- Users can only see themselves
CREATE POLICY users_isolation ON users
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- Goals: own goals only
CREATE POLICY goals_isolation ON goals
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- Folios: own folios only
CREATE POLICY folios_isolation ON folios
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- Transactions: via folio ownership
CREATE POLICY transactions_isolation ON transactions
    USING (
        folio_id IN (
            SELECT folio_id FROM folios
            WHERE user_id = current_setting('app.current_user_id', TRUE)::UUID
        )
    );

-- Non-MF assets: own assets only
CREATE POLICY non_mf_assets_isolation ON non_mf_assets
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- LTCG records: own records only
CREATE POLICY ltcg_isolation ON ltcg_harvest_records
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- Sessions: own sessions only
CREATE POLICY sessions_isolation ON user_sessions
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- CAS imports: own imports only
CREATE POLICY cas_imports_isolation ON cas_imports
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- Alert preferences: own preferences only
CREATE POLICY alert_prefs_isolation ON alert_preferences
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- SIP history: via folio ownership
CREATE POLICY sip_history_isolation ON sip_history
    USING (
        folio_id IN (
            SELECT folio_id FROM folios
            WHERE user_id = current_setting('app.current_user_id', TRUE)::UUID
        )
    );

-- funds and nav_history are shared master data — no RLS needed
-- (read-only for all users, written only by the NAV fetch Lambda)

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE users                IS 'One row per registered user. All monetary values in paise (₹1 = 100 paise).';
COMMENT ON TABLE goals                IS 'Investment goals. type drives UI colour and defaults. investment_mode drives dashboard panel state.';
COMMENT ON TABLE funds                IS 'Master fund list populated from AMFI. Shared across all users — no user_id here.';
COMMENT ON TABLE folios               IS 'One row per fund per goal per user. allocation_pct values per goal_id must sum to 1.0.';
COMMENT ON TABLE sip_history          IS 'Tracks SIP amount changes over time for accurate historical invested calculation.';
COMMENT ON TABLE transactions         IS 'Every buy/redeem event. Soft delete via deleted_at. Units = amount / (nav / 1000).';
COMMENT ON TABLE nav_history          IS 'Daily NAV cache from AMFI. nav stored as paise*1000 for 3dp precision without floats.';
COMMENT ON TABLE non_mf_assets        IS 'EPF, NPS, Gold, etc. current_value updated manually. Gold quantity in grams for spot price auto-calc.';
COMMENT ON TABLE ltcg_harvest_records IS 'FIFO-calculated harvest records. ltcg_crystallised = redemption_value - cost_basis.';
COMMENT ON TABLE user_sessions        IS 'JWT refresh token store. revoked_at IS NULL = active session.';
COMMENT ON TABLE cas_imports          IS 'Audit log of CAS PDF imports. One row per import attempt.';
COMMENT ON TABLE alert_preferences    IS 'Per-user alert opt-in/out. Created with defaults on first login.';

COMMENT ON COLUMN transactions.nav    IS 'Stored as paise * 1000. ₹86.451 NAV = 86451 stored. Divide by 1000 to display.';
COMMENT ON COLUMN transactions.units  IS 'Calculated = (amount_paise / nav_paise) * 1000. Never entered manually.';
COMMENT ON COLUMN folios.folio_number IS 'Nullable — CAS import fills this. User can save goal without folio number during onboarding.';
COMMENT ON COLUMN goals.investment_mode IS 'Drives dashboard: LUMPSUM_ONLY → show deployment status panel. SIP present → show SIP confirmation panel.';
COMMENT ON COLUMN non_mf_assets.quantity IS 'Grams for Gold/Silver (app multiplies by MCX spot price). Units for equity.';
COMMENT ON COLUMN ltcg_harvest_records.tax_payable IS 'In paise. MAX(0, cumulative_fy_ltcg - 12500000) * 0.125. 12500000 paise = ₹1,25,000.';
```

---

---

## Design System & Theme Configuration

**IMPORTANT:** WealthTrack must have a distinct visual identity from FireCal and Tax Harvesting Calculator. All styling must be theme-driven with **zero runtime inline styles**.

### Design Principles

1. **Theme-First Architecture** — All visual values (colors, spacing, typography, borders) MUST come from theme files only
2. **No Inline Styles** — Runtime `style={{}}` props are strictly forbidden
3. **Component Composition** — Use shadcn/ui variants and Tailwind classes from design tokens only
4. **Consistent Visual Language** — WealthTrack uses a professional finance aesthetic distinct from FireCal's calculator UI

### UX Principles (from PRD v3)

All 7 principles from v2 remain. Four new principles added:

1. **Allocation % must total exactly 100%**
   - Live validator on Add New Goal Step 3 and on Goal Detail folio register edit
   - Amber warning when not 100%
   - Green confirm when exactly 100%
   - Save blocked until valid

2. **Inline projections — not in settings**
   - Indicative lumpsum/SIP projections shown during goal creation (Step 2 of wizard)
   - Not buried in settings or a separate calculator
   - Always labelled "indicative at 12% CAGR — not a recommendation"

3. **Goal type is a first-class field**
   - Goal type drives: icon, card accent colour, default investment mode, horizon hint
   - Not cosmetic — it changes UI behaviour
   - Stored as enum, not free text
   - **Immutable after creation** — changing type would break color coding and historical context

4. **Lumpsum-only state is a valid first-class state**
   - Dashboard does not assume SIPs exist
   - If no SIPs, cashflow panel shows lumpsum deployment status instead of SIP confirmation
   - No empty state / "add a SIP" pressure
   - Panel switches automatically when first SIP added

### Theme File Structure

**Create these theme configuration files:**

```
/src/
  /themes/
    wealthtrack/
      tokens.ts          # Core design tokens
      colors.ts          # Color palette definitions
      spacing.ts         # Spacing scale
      typography.ts      # Font sizes, weights, line heights
      borders.ts         # Border radius, widths
      shadows.ts         # Box shadows
      index.ts           # Theme export
  /components/
    /ui/                 # shadcn/ui components
    /wealthtrack/        # WealthTrack-specific components
```

### Theme Tokens File

**File:** `/src/themes/wealthtrack/tokens.ts`

```typescript
// ============================================
// WEALTHTRACK DESIGN TOKENS
// ============================================
// ALL visual values must be imported from here
// NO hardcoded values allowed in components

export const tokens = {
  // ============================================
  // WEALTHTRACK DESIGN TOKENS - Glass Nature Theme
  // ============================================
  // Colors from wealthtrack_v3.html
  // NO hardcoded values allowed in components

  colors: {
    // Core palette - Nature/Green inspired
    pine:   '#1A3A28',    // Dark green - hero panels
    forest: '#2D5A40',    // Primary action gradient start
    sage:   '#4A8060',    // Primary brand
    mint:   '#7BB89A',    // Accents, highlights
    foam:   '#C8E6D4',    // Light backgrounds
    mist:   '#EEF7F2',    // Lightest background

    // Background palette - Dark theme
    bg: {
      page:   '#0F2A1C',   // Main page background
      pine:   '#1A3A28',   // Dark card backgrounds
      elevated: '#FFFFFF',
    },

    // Text colors (ink palette)
    ink: {
      DEFAULT: '#1A2E20',  // Primary text
      2:       '#4A6654',  // Secondary text
      3:       '#8AA896',  // Muted/hint text
    },

    // Surface colors
    surface: {
      DEFAULT: '#FFFFFF',
      2: 'rgba(238,247,242,0.7)',
      subtle: 'rgba(255,255,255,0.08)',
    },

    // Glass morphism tokens
    glass: {
      bg:      'rgba(255,255,255,0.62)',
      bgDark:  'rgba(255,255,255,0.42)',
      bgPine:  'rgba(26,58,40,0.55)',
      border:  'rgba(255,255,255,0.75)',
      borderPine: 'rgba(123,184,154,0.25)',
    },

    // Semantic colors (from HTML)
    semantic: {
      green:  { DEFAULT: '#1D6B3E', light: '#D4EDDE' },
      amber:  { DEFAULT: '#8B5E0A', light: '#FEF3DC' },
      red:    { DEFAULT: '#8B2020', light: '#FCEAEA' },
      blue:   { DEFAULT: '#1A4A8A', light: '#E0EDFB' },
    },

    // Goal progress colors
    progress: {
      red:   '#8B2020',     // < 50% - danger red
      amber: '#8B5E0A',     // 50-90% - warning amber
      green: '#1D6B3E',     // > 90% - success green
    },

    // Transaction types
    transaction: {
      buyLumpsum: '#2563EB',  // Blue
      buySip:     '#1D6B3E',  // Green
      buyStp:     '#7C3AED',  // Purple
      redeem:     '#DC2626',  // Red
      switch:     '#EA580C',  // Orange
      dividend:   '#0891B2',  // Cyan
    },

    // Asset types
    asset: {
      mf:       '#3B82F6',
      epf:      '#F97316',
      nps:      '#8B5CF6',
      gold:     '#EAB308',
      equity:   '#10B981',
      emergency:'#06B6D4',
    },
  },
  
  // Spacing scale (in pixels, converted to rem in CSS)
  spacing: {
    '0': '0',
    'px': '1px',
    '0.5': '0.125rem',  // 2px
    '1': '0.25rem',     // 4px
    '1.5': '0.375rem',  // 6px
    '2': '0.5rem',      // 8px
    '2.5': '0.625rem',  // 10px
    '3': '0.75rem',     // 12px
    '3.5': '0.875rem',  // 14px
    '4': '1rem',        // 16px
    '5': '1.25rem',     // 20px
    '6': '1.5rem',      // 24px
    '7': '1.75rem',     // 28px
    '8': '2rem',        // 32px
    '9': '2.25rem',     // 36px
    '10': '2.5rem',     // 40px
    '11': '2.75rem',    // 44px
    '12': '3rem',       // 48px
    '14': '3.5rem',     // 56px
    '16': '4rem',       // 64px
    '20': '5rem',       // 80px
    '24': '6rem',       // 96px
    '28': '7rem',       // 112px
    '32': '8rem',       // 128px
    '36': '9rem',       // 144px
    '40': '10rem',      // 160px
    '44': '11rem',      // 176px
    '48': '12rem',      // 192px
    '52': '13rem',      // 208px
    '56': '14rem',      // 224px
    '60': '15rem',      // 240px
    '64': '16rem',      // 256px
    '72': '18rem',      // 288px
    '80': '20rem',      // 320px
    '96': '24rem',      // 384px
  },
  
  // Typography - DM Sans / DM Mono / Cormorant Garamond
  typography: {
    fontFamily: {
      sans:  ["'DM Sans'", 'system-ui', '-apple-system', 'sans-serif'],
      mono:  ["'DM Mono'", 'Menlo', 'Monaco', 'monospace'],
      serif: ["'Cormorant Garamond'", 'Georgia', 'serif'],
    },
    fontSize: {
      '2xs': ['0.625rem', { lineHeight: '0.875rem' }],    // 10px - labels
      'xs':  ['0.75rem',  { lineHeight: '1rem' }],       // 12px - small text
      'sm':  ['0.875rem', { lineHeight: '1.25rem' }],    // 14px - body small
      'base':['1rem',     { lineHeight: '1.55' }],        // 16px - body (from HTML)
      'lg':  ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
      'xl':  ['1.25rem',  { lineHeight: '1.75rem' }],    // 20px - h2
      '2xl': ['1.5rem',   { lineHeight: '2rem' }],      // 24px
      '3xl': ['1.625rem', { lineHeight: '1.3' }],       // 26px - h1 in HTML
      '4xl': ['2.25rem',  { lineHeight: '1.2' }],       // 36px
      '5xl': ['2.5rem',   { lineHeight: '1.2' }],       // 40px
      '6xl': ['3rem',     { lineHeight: '1' }],         // 48px
      '7xl': ['3.75rem',  { lineHeight: '1' }],         // 60px
      '8xl': ['4.5rem',   { lineHeight: '1' }],         // 72px
    },
    fontWeight: {
      light:   '300',
      normal:  '400',
      medium:  '500',
      semibold:'600',
      bold:    '700',
    },
    lineHeight: {
      'none': '1',
      'tight': '1.25',
      'snug': '1.375',
      'normal': '1.5',
      'relaxed': '1.625',
      'loose': '2',
    },
    letterSpacing: {
      'tighter': '-0.05em',
      'tight': '-0.025em',
      'normal': '0',
      'wide': '0.025em',
      'wider': '0.05em',
      'widest': '0.1em',
    },
  },
  
  // Border radius (from HTML: --r, --r-sm, --r-lg)
  borderRadius: {
    'none': '0',
    'sm': '8px',     // r-sm: 8px
    'DEFAULT': '12px', // r: 12px
    'md': '12px',
    'lg': '18px',    // r-lg: 18px
    'xl': '24px',
    'full': '9999px',
  },
  
  // Border widths
  borderWidth: {
    '0': '0px',
    'DEFAULT': '1px',
    '2': '2px',
    '4': '4px',
    '8': '8px',
  },
  
  // Shadows - Glass morphism style
  shadows: {
    'none': 'none',
    // Glass shadow
    'glass': '0 8px 32px rgba(26,58,40,0.12), 0 2px 8px rgba(26,58,40,0.08)',
    'glassHover': '0 12px 40px rgba(26,58,40,0.18)',
    'card': '0 8px 32px rgba(26,58,40,0.12), 0 2px 8px rgba(26,58,40,0.08)',
    'cardHover': '0 12px 40px rgba(26,58,40,0.18)',
    'pine': '0 12px 40px rgba(0,0,0,0.25)',
    'dropdown': '0 10px 15px -3px rgba(26,58,40,0.15)',
    'modal': '0 25px 50px -12px rgba(0,0,0,0.35)',
    'button': '0 2px 8px rgba(29,107,62,.3)',
    'buttonHover': '0 4px 12px rgba(29,107,62,.4)',
    // Progress bar glow
    'progressGreen': '0 0 6px #4ade80',
  },
  
  // Z-index scale
  zIndex: {
    '0': '0',
    '10': '10',
    '20': '20',
    '30': '30',
    '40': '40',
    '50': '50',
    'dropdown': '100',
    'sticky': '200',
    'modal': '300',
    'popover': '400',
    'tooltip': '500',
    'toast': '600',
  },
  
  // Transitions
  transition: {
    'fast': '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    'DEFAULT': '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    'slow': '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Breakpoints (for reference, Tailwind default)
  breakpoints: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  },
} as const;

// Type exports for TypeScript safety
export type Tokens = typeof tokens;
export type Colors = Tokens['colors'];
export type Spacing = Tokens['spacing'];
export type Typography = Tokens['typography'];
export type BorderRadius = Tokens['borderRadius'];
export type Shadows = Tokens['shadows'];
```

### Tailwind Configuration Extension

**File:** Update `/tailwind.config.js` to include WealthTrack theme

```javascript
import { tokens } from './src/themes/wealthtrack/tokens';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "24px",
      screens: {
        "2xl": "1080px",
      },
    },
    extend: {
      // WealthTrack Nature/Glass Theme
      colors: {
        // Core nature palette
        pine: tokens.colors.pine,
        forest: tokens.colors.forest,
        sage: tokens.colors.sage,
        mint: tokens.colors.mint,
        foam: tokens.colors.foam,
        mist: tokens.colors.mist,
        
        // Background system
        background: {
          DEFAULT: tokens.colors.bg.page,
          page: tokens.colors.bg.page,
          pine: tokens.colors.bg.pine,
        },
        
        // Text system (ink)
        foreground: tokens.colors.ink.DEFAULT,
        ink: tokens.colors.ink,
        
        // Surface
        surface: tokens.colors.surface,
        
        // Glass tokens
        glass: tokens.colors.glass,
        
        // Semantic
        green: {
          DEFAULT: tokens.colors.semantic.green.DEFAULT,
          light: tokens.colors.semantic.green.light,
        },
        amber: {
          DEFAULT: tokens.colors.semantic.amber.DEFAULT,
          light: tokens.colors.semantic.amber.light,
        },
        red: {
          DEFAULT: tokens.colors.semantic.red.DEFAULT,
          light: tokens.colors.semantic.red.light,
        },
        blue: {
          DEFAULT: tokens.colors.semantic.blue.DEFAULT,
          light: tokens.colors.semantic.blue.light,
        },
        
        // shadcn/ui mapping for glass theme
        primary: {
          DEFAULT: tokens.colors.sage,
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'rgba(255,255,255,0.1)',
          foreground: tokens.colors.ink.DEFAULT,
        },
        muted: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          foreground: tokens.colors.ink[3],
        },
        accent: {
          DEFAULT: tokens.colors.mint,
          foreground: tokens.colors.ink.DEFAULT,
        },
        destructive: {
          DEFAULT: tokens.colors.semantic.red.DEFAULT,
          foreground: '#ffffff',
        },
        border: 'rgba(74,102,84,0.15)',
        input: 'rgba(74,102,84,0.2)',
        ring: tokens.colors.sage,
        
        // Progress colors
        progress: tokens.colors.progress,
      },
      spacing: tokens.spacing,
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize,
      fontWeight: tokens.typography.fontWeight,
      lineHeight: tokens.typography.lineHeight,
      letterSpacing: tokens.typography.letterSpacing,
      borderRadius: tokens.borderRadius,
      borderWidth: tokens.borderWidth,
      boxShadow: tokens.shadows,
      zIndex: tokens.zIndex,
      transitionDuration: {
        'fast': '150ms',
        'DEFAULT': '200ms',
        'slow': '300ms',
      },
      backdropBlur: {
        'glass': '18px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "drift": {
          from: { transform: "translate(0,0) scale(1)" },
          to: { transform: "translate(40px,30px) scale(1.08)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "drift": "drift 18s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Component Styling Patterns

**CORRECT Pattern - Using Theme Tokens:**
```typescript
// /src/components/wealthtrack/GoalCard.tsx
import { tokens } from '@/themes/wealthtrack/tokens';

export function GoalCard({ goal }: GoalCardProps) {
  // Use Tailwind classes derived from theme
  return (
    <div className="
      glass
      rounded-lg
      shadow-glass
      p-5
      border-t-[3px]
      border-t-green
      hover:shadow-glassHover
      transition-all
      duration-200
    ">
      {/* Typography from theme */}
      <h3 className="text-sm font-medium text-ink">
        {goal.name}
      </h3>
      
      {/* Progress bar with semantic colors */}
      <div className="mt-3">
        <div className="h-[5px] bg-black/5 rounded-[3px] overflow-hidden">
          <div 
            className="h-full rounded-[3px] transition-all duration-500"
            style={{ 
              width: `${goal.progress}%`,
              background: goal.progress >= 90 
                ? 'linear-gradient(90deg,#2D8A50,#4ade80)' 
                : goal.progress >= 50 
                  ? 'linear-gradient(90deg,#C87820,#FBBF24)' 
                  : 'linear-gradient(90deg,#C02020,#F87171)'
            }}
          />
        </div>
      </div>
      
      {/* Spacing from theme */}
      <div className="mt-3 flex items-center gap-4">
        {/* ... */}
      </div>
    </div>
  );
}
```

**INCORRECT Pattern - Inline Styles (FORBIDDEN):**
```typescript
// ❌ NEVER DO THIS
export function BadComponent() {
  return (
    <div 
      style={{ 
        backgroundColor: '#ffffff',  // ❌ Hardcoded color
        padding: '24px',              // ❌ Hardcoded spacing
        borderRadius: '12px',         // ❌ Hardcoded radius
        fontSize: '16px',             // ❌ Hardcoded typography
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'  // ❌ Hardcoded shadow
      }}
    >
      ❌ Bad component with inline styles
    </div>
  );
}
```

### shadcn/ui Component Theming

**File:** `/src/components/ui/button.tsx` (shadcn override for WealthTrack)

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// All values come from theme tokens via Tailwind classes
const buttonVariants = cva(
  // Base styles using Tailwind classes (which map to theme)
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary - using theme colors
        default: "bg-primary-600 text-white hover:bg-primary-700",
        
        // Secondary
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        
        // Destructive
        destructive: "bg-red-600 text-white hover:bg-red-700",
        
        // Outline
        outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
        
        // Ghost
        ghost: "hover:bg-gray-100 text-gray-700",
        
        // Link
        link: "text-primary-600 underline-offset-4 hover:underline",
        
        // WealthTrack specific variants
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-amber-500 text-white hover:bg-amber-600",
        info: "bg-cyan-500 text-white hover:bg-cyan-600",
      },
      size: {
        // Spacing from theme
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### CSS Variables (Global Styles)

**File:** `/src/index.css` - Update with WealthTrack CSS variables

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* WealthTrack Glass Nature Design System */
    
    /* Core palette */
    --pine:   #1A3A28;
    --forest: #2D5A40;
    --sage:   #4A8060;
    --mint:   #7BB89A;
    --foam:   #C8E6D4;
    --mist:   #EEF7F2;
    
    /* Glass tokens */
    --glass-bg:      rgba(255,255,255,0.62);
    --glass-bg-dark: rgba(255,255,255,0.42);
    --glass-bg-pine: rgba(26,58,40,0.55);
    --glass-border:  rgba(255,255,255,0.75);
    --glass-border-pine: rgba(123,184,154,0.25);
    --glass-shadow:  0 8px 32px rgba(26,58,40,0.12), 0 2px 8px rgba(26,58,40,0.08);
    
    /* Surface */
    --bg-page:   #0F2A1C;
    --ink:       #1A2E20;
    --ink-2:     #4A6654;
    --ink-3:     #8AA896;
    --surface:   #FFFFFF;
    --surface-2: rgba(238,247,242,0.7);
    
    /* Semantic */
    --green:  #1D6B3E;
    --green-l:#D4EDDE;
    --amber:  #8B5E0A;
    --amber-l:#FEF3DC;
    --red:    #8B2020;
    --red-l:  #FCEAEA;
    --blue:   #1A4A8A;
    --blue-l: #E0EDFB;
    
    /* Border radius */
    --radius: 12px;
    --radius-sm: 8px;
    --radius-lg: 18px;
    
    /* Typography */
    --font-sans:  'DM Sans', system-ui, -apple-system, sans-serif;
    --font-mono:  'DM Mono', Menlo, Monaco, monospace;
    --font-serif: 'Cormorant Garamond', Georgia, serif;
  }

  * {
    @apply border-border;
    box-sizing: border-box;
  }
  
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
    font-size: 14px;
    line-height: 1.55;
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Typography base */
  h1 { @apply text-[22px] font-medium text-ink; }
  h2 { @apply text-[17px] font-medium text-ink; }
  h3 { @apply text-[14px] font-medium text-ink; }
}

@layer components {
  /* Glass morphism card */
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--glass-shadow);
  }
  
  .glass-dark {
    background: var(--glass-bg-dark);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: var(--radius-lg);
    box-shadow: var(--glass-shadow);
  }
  
  /* Pine glass for onboarding */
  .glass-pine {
    background: var(--glass-bg-pine);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid var(--glass-border-pine);
    border-radius: var(--radius-lg);
    box-shadow: 0 12px 40px rgba(0,0,0,0.25);
    color: #fff;
  }
  
  /* Label pattern */
  .label {
    @apply text-[11px] font-medium tracking-[0.05em] uppercase text-ink-3;
  }
  
  .label-light {
    @apply text-[11px] font-medium tracking-[0.05em] uppercase text-white/50;
  }
  
  /* Badge patterns */
  .badge {
    @apply inline-flex items-center px-2 py-[3px] rounded-full text-[11px] font-medium;
  }
  
  .badge-green {
    background: var(--green-l);
    color: var(--green);
  }
  
  .badge-amber {
    background: var(--amber-l);
    color: var(--amber);
  }
  
  .badge-red {
    background: var(--red-l);
    color: var(--red);
  }
  
  .badge-glass {
    @apply bg-white/20 text-white border border-white/30;
  }
  
  /* Progress bar */
  .progress-track {
    @apply h-[5px] bg-black/5 rounded-[3px] overflow-hidden;
  }
  
  .progress-fill {
    @apply h-full rounded-[3px] transition-all;
    transition-timing-function: cubic-bezier(.4,0,.2,1);
    transition-duration: 400ms;
  }
  
  .progress-fill-green {
    background: linear-gradient(90deg,#2D8A50,#4ade80);
  }
  
  .progress-fill-amber {
    background: linear-gradient(90deg,#C87820,#FBBF24);
  }
  
  .progress-fill-red {
    background: linear-gradient(90deg,#C02020,#F87171);
  }
  
  /* Button patterns */
  .btn-primary {
    @apply inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 border border-white/15;
    background: linear-gradient(135deg,#2D8A50,#1D6B3E);
    color: #fff;
    box-shadow: 0 2px 8px rgba(29,107,62,.3);
  }
  
  .btn-primary:hover {
    background: linear-gradient(135deg,#349458,#237A46);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(29,107,62,.4);
  }
  
  .btn-glass {
    @apply inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150;
    background: rgba(255,255,255,.65);
    color: var(--ink);
    border: 1px solid rgba(255,255,255,.8);
    backdrop-filter: blur(8px);
  }
  
  .btn-glass:hover {
    background: rgba(255,255,255,.85);
  }
  
  .btn-outline-light {
    @apply inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 border border-white/30;
    background: rgba(255,255,255,.1);
    color: #fff;
  }
  
  .btn-outline-light:hover {
    background: rgba(255,255,255,.18);
  }
  
  /* Form patterns */
  .wt-input {
    @apply w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-all duration-150;
    border: 1px solid rgba(74,102,84,.2);
    color: var(--ink);
    background: rgba(255,255,255,.85);
    backdrop-filter: blur(8px);
    font-family: var(--font-sans);
  }
  
  .wt-input:focus {
    border-color: var(--sage);
    background: rgba(255,255,255,.95);
    box-shadow: 0 0 0 3px rgba(74,128,96,.15);
  }
  
  /* Table patterns */
  .wt-table th {
    @apply text-[11px] font-medium tracking-[0.04em] uppercase text-ink-3 text-left px-3.5 py-2;
    border-bottom: 1px solid rgba(74,102,84,.15);
  }
  
  .wt-table td {
    @apply px-3.5 py-3 text-[13px] text-ink;
    border-bottom: 1px solid rgba(74,102,84,.08);
  }
  
  .wt-table tr:hover td {
    background: rgba(74,128,96,.04);
  }
  
  /* Onboarding input (dark theme) */
  .ob-input {
    @apply w-full px-4 py-3 rounded-lg text-[14px] outline-none transition-all duration-200;
    border: 1px solid rgba(255,255,255,.2);
    color: #fff;
    background: rgba(255,255,255,.1);
    backdrop-filter: blur(12px);
  }
  
  .ob-input::placeholder {
    color: rgba(255,255,255,.35);
  }
  
  .ob-input:focus {
    border-color: rgba(123,184,154,.6);
    background: rgba(255,255,255,.15);
    box-shadow: 0 0 0 3px rgba(123,184,154,.15);
  }
  
  /* Goal card */
  .goal-card {
    @apply glass p-4 cursor-pointer transition-all duration-200;
    border-top: 3px solid transparent;
  }
  
  .goal-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(26,58,40,.18);
  }
  
  /* Metric box */
  .metric-box {
    @apply rounded-lg px-4 py-3;
    background: rgba(238,247,242,.65);
    border: 1px solid rgba(74,102,84,.12);
  }
  
  .metric-box-yellow {
    @apply rounded-lg px-4 py-3;
    background: rgba(254,243,220,.7);
    border: 1px solid rgba(212,160,0,.25);
  }
}

@layer utilities {
  /* Text utilities */
  .text-balance {
    text-wrap: balance;
  }
  
  .font-serif {
    font-family: var(--font-serif);
  }
  
  /* Currency display */
  .currency-inr {
    @apply font-mono tabular-nums;
  }
  
  /* Muted/hint text */
  .hint {
    color: var(--ink-3);
    font-size: 12px;
  }
  
  .muted {
    color: var(--ink-2);
  }
  
  /* Background mesh gradient */
  .bg-mesh {
    position: fixed;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 10%, rgba(74,128,96,0.35) 0%, transparent 60%),
      radial-gradient(ellipse 60% 80% at 80% 90%, rgba(45,90,64,0.4) 0%, transparent 60%),
      radial-gradient(ellipse 70% 50% at 60% 40%, rgba(123,184,154,0.15) 0%, transparent 55%),
      linear-gradient(160deg, #0F2A1C 0%, #162F22 40%, #0C1F15 100%);
  }
}
```

### Component Creation Rules

**All WealthTrack components MUST follow these rules:**

1. **No Inline Styles** — Never use `style={{}}` prop
2. **Tailwind Classes Only** — All styling via `className` with Tailwind utilities
3. **Theme Token Import** — When dynamic values needed, import from `tokens.ts`
4. **Variant Pattern** — Use `cva` (class-variance-authority) for component variants
5. **Composition** — Compose from shadcn/ui base components

**Example: Proper Component Structure**

```typescript
// /src/components/wealthtrack/TransactionBadge.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define variants using theme-mapped classes
const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
  {
    variants: {
      type: {
        buyLumpsum: "bg-blue-100 text-blue-800",
        buySip: "bg-green-100 text-green-800",
        buyStp: "bg-purple-100 text-purple-800",
        redeem: "bg-red-100 text-red-800",
        switch: "bg-amber-100 text-amber-800",
        dividend: "bg-cyan-100 text-cyan-800",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-1",
      },
    },
    defaultVariants: {
      type: "buyLumpsum",
      size: "md",
    },
  }
);

interface TransactionBadgeProps
  extends VariantProps<typeof badgeVariants> {
  label: string;
  className?: string;
}

export function TransactionBadge({ 
  type, 
  size, 
  label, 
  className 
}: TransactionBadgeProps) {
  return (
    <span className={cn(badgeVariants({ type, size }), className)}>
      {label}
    </span>
  );
}
```

### Visual Identity - WealthTrack vs FireCal

| Aspect | FireCal (Calculator) | WealthTrack (Portfolio App) |
|--------|---------------------|----------------------------|
| **Primary Color** | Orange/Calculated warm | Green/Nature trust (#1A3A28 pine) |
| **Background** | Light/white | Dark green (#0F2A1C) with mesh gradient |
| **Card Style** | Solid white | Glass morphism (blur + transparency) |
| **Density** | Sparse, centered | Information-dense, grid |
| **Typography** | Inter | DM Sans + Cormorant Garamond (serif) |
| **Font Sizes** | Larger display | 14px base, 22px h1, 17px h2 |
| **Spacing** | Generous, airy | Compact, efficient |
| **Cards** | Single centered card | Multiple glass cards |
| **Navigation** | None (single page) | Full topbar nav with glass effect |
| **Visual Weight** | Heavy on inputs | Heavy on data display |
| **Progress Bars** | Solid colors | Gradient (green/amber/red) |
| **Border Radius** | Standard 4-8px | 12px default, 8px small, 18px large |

### File Naming Conventions

**WealthTrack-specific files:**
- Prefix: `wt-` or place in `/components/wealthtrack/`
- Examples: `wt-dashboard-card.tsx`, `wt-goal-progress.tsx`

**Theme files:**
- All in `/src/themes/wealthtrack/`
- No theme code in component files

**Page files:**
- `/src/pages/` for route-level components
- Use kebab-case: `goal-detail.tsx`, `sip-manager.tsx`

---

## Frontend Implementation Tasks


### Phase 1: Core Infrastructure & Auth

#### Task 1.1: Update Existing Landing Page
**File:** `/src/App.tsx` or landing page component

Add login button to the existing FireCal/Tax Harvest landing page:

```typescript
// Add to existing landing page
<Button 
  onClick={() => navigate('/login')}
  className="absolute top-4 right-4"
>
  Login
</Button>
```

**Acceptance Criteria:**
- [ ] Login button visible on existing landing page
- [ ] Button navigates to /login route

---

#### Task 1.2: Create Auth Context & Protected Routes
**Files to Create:**
- `/src/contexts/AuthContext.tsx`
- `/src/components/ProtectedRoute.tsx`

```typescript
// /src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Acceptance Criteria:**
- [ ] Auth context provides user state globally
- [ ] ProtectedRoute redirects unauthenticated users to /login
- [ ] Sign-in with Google OAuth flow works

---

#### Task 1.3: Create Login Screen
**File:** `/src/pages/Login.tsx`

**Design (per PRD Doc 4, Screen 0):**

Split-screen layout:
- **Left Panel (Brand) — 50% width:**
  - Dark forest-green background with full visibility of animated orbs
  - Logo (Cormorant Garamond serif font)
  - Tagline: "Track your wealth, grow your future"
  - 4 feature bullets with icons:
    - NAV auto-fetch
    - CAS import
    - LTCG tracker
    - Tracking-only (no trades)
  - Legal note at bottom

- **Right Panel (Auth Card) — 50% width:**
  - Centered glass card (`.glass-pine` style)
  - "Welcome back" heading (serif, italic for emphasis)
  - Google OAuth button (primary action — prominent)
  - Divider: "or continue with email"
  - Email input field
  - Password input field
  - Sign in button (secondary)
  - "No account? Create one" link
  - Trust note below: "Tracking only. WealthTrack never connects to your broker. No trades executed."

**Visual Style:**
- Background: Dark green mesh (#0F2A1C with radial gradient overlays)
- Left panel text: White
- Right panel card: `.glass-pine` — rgba(26,58,40,0.55) bg, 20px blur, white text
- Inputs on glass: Dark glass style — rgba(255,255,255,0.1) bg, white text

**Behavior:**
- Google button initiates OAuth flow
- On success: First-time user → Onboarding Wizard; Returning user → Dashboard
- No password reset in Phase 1 (deferred to Phase 2)

**Acceptance Criteria:**
- [ ] Left panel shows brand, tagline, 4 feature bullets
- [ ] Glass card centered on right with welcome message
- [ ] Google OAuth as primary path
- [ ] Email/password as fallback
- [ ] Trust note visible below sign-in button
- [ ] On success, redirects to onboarding (first time) or dashboard (returning)
- [ ] Dark glass input style for email/password fields
- [ ] Hidden topbar on login screen (appears only after login)

---

#### Task 1.4: Create 9-Step Onboarding Wizard
**Files to Create:**
- `/src/pages/onboarding/OnboardingWizard.tsx` (main container)
- `/src/pages/onboarding/steps/Step1Profile.tsx`
- `/src/pages/onboarding/steps/Step2FireGoal.tsx`
- `/src/pages/onboarding/steps/Step3ImportMethod.tsx`
- `/src/pages/onboarding/steps/Step4GoalSelection.tsx`
- `/src/pages/onboarding/steps/Step5GoalDetails.tsx`
- `/src/pages/onboarding/steps/Step6LumpsumInvestments.tsx`
- `/src/pages/onboarding/steps/Step7SIPs.tsx`
- `/src/pages/onboarding/steps/Step8OtherAssets.tsx`
- `/src/pages/onboarding/steps/Step9Confirmation.tsx`
- `/src/components/onboarding/ProgressBar.tsx`
- `/src/components/onboarding/GoalTypeCard.tsx`
- `/src/components/onboarding/LumpsumEntryBlock.tsx`
- `/src/components/onboarding/SIPEntryBlock.tsx`

**Step Details (per PRD Doc 3):**

**Step 1 — Profile:**
- Name (text input)
- Current age (number)
- Monthly household expenses (₹ input, stored in paise)

**Step 2 — FIRE Goal:**
- FIRE target age (number)
- Safe withdrawal rate slider (2.5% - 3.5%, default 2.75%)
- Inflation assumption (default 6%)

**Step 3 — Import Method (3 option cards):**
- CAS import (recommended) — with instructions to email cas@camsonline.com or mystatement@kfintech.com
- Manual entry — for users without CAS
- No existing investments — for fresh starters

**Step 4 — Goal Selection (6 type cards in 3×2 grid):**
- FIRE 🔥
- School fees 🏫
- Graduation 🎓
- Marriage 💍
- House / down payment 🏡
- Custom ✦
- Multi-select with green highlight on selection

**Step 5 — Goal Details:**
- One expandable block per selected goal
- Target corpus ₹ (numeric, yellow input — user-owned, never auto)
- Target year (numeric, e.g., 2037)
- Live projection appears: Horizon years, Lumpsum needed at 12%, Monthly SIP equivalent

**Step 6 — Lumpsum Investments:**
- Add/remove entry blocks freely
- Each block: Fund name (dropdown), Amount ₹, Date picker, Goal assignment, Folio number (optional)
- Pre-populated if CAS import selected

**Step 7 — SIPs:**
- Add/remove SIP blocks
- Each block: Fund name, Monthly amount ₹, SIP date (day of month), Start date, Goal assignment
- Pre-populated if CAS import selected

**Step 8 — Other Assets (4 fixed sections):**
- EPF: Current balance ₹, Monthly employer contribution ₹
- NPS: Current balance ₹, Monthly own contribution ₹
- Gold/Silver: Grams held, Type (Physical/SGB/ETF)
- Emergency fund: Current balance ₹

**Step 9 — Confirmation:**
- Read-only summary: Profile, Goals (count + names), Lumpsum investments (count), Active SIPs (count), Other assets (summary)
- Back button to any step
- "Go to dashboard" button saves all and navigates

**Visual Design:**
- Dark green mesh background (full visibility of animated orbs)
- Dark glass inputs: rgba(255,255,255,0.1) bg, white text
- Progress bar at top showing 9 steps
- Back button on every step (Step 2-9)
- Step transition animations

**State Management:**
- Use React Context or Zustand for onboarding state
- Persist partial progress to localStorage
- Validate each step before allowing Next

**Acceptance Criteria:**
- [ ] All 9 steps navigable with Back/Next
- [ ] Progress bar fills correctly across steps
- [ ] Step 4 allows multi-select goal types with visual feedback
- [ ] Step 5 shows live projections when target + year filled
- [ ] Step 6 and 7 support add/remove entry blocks
- [ ] Step 9 shows read-only summary with all entered data
- [ ] Data persists when going back to previous steps
- [ ] On complete, dashboard populates with all data + live NAVs
- [ ] Total onboarding time ~16 minutes

---

### Phase 2: Dashboard & Core UI

#### Task 2.1: Create Main Layout with Navigation
**Files to Create:**
- `/src/components/layout/MainLayout.tsx`
- `/src/components/layout/Sidebar.tsx` (or TopNav)

Navigation items per PRD:
- Dashboard
- Goals
- Transactions
- Harvest (LTCG)
- Settings

**Acceptance Criteria:**
- [ ] Layout renders consistently across all authenticated pages
- [ ] Navigation highlights active route
- [ ] User profile dropdown with sign-out option

---

#### Task 2.2: Create Dashboard Page
**File:** `/src/pages/Dashboard.tsx`

Components needed:
1. **Net Worth Header** — large number display
2. **FIRE Progress Widget** — if user has FIRE goal
3. **Monthly Cashflow Panel** — TWO STATES (per PRD Doc 4, Screen 1):
   - **SIP State** (user has ≥1 active SIP):
     - Monthly SIP commitment total
     - Per-SIP rows with confirmation status badges (Confirmed / Pending / Missed)
   - **Lumpsum-Only State** (user has 0 active SIPs):
     - Info chip: "No SIPs active — all goals funded by lumpsum"
     - Per-goal lumpsum deployment status:
       - Deployed ₹ / Needed ₹
       - Mini progress bar
       - "Fully deployed" or "₹X pending" label
     - Total deployed footer
     - "Add SIP" CTA link
4. **Goal Cards Grid** — one card per goal (with goal type color-coded top border)
5. **Asset Allocation Donut Chart**
6. **LTCG Alert Banner** — conditional (Feb-Mar)

**Lumpsum-Only State Detection:**
- Check if user has any active SIPs (sip_active = true)
- Auto-detect on dashboard load — no user action needed
- Panel switches automatically when first SIP added (no page refresh needed)
- Dashboard cashflow panel **always reflects current SIP state**

**Goal Card Color Coding (from Goal Type):**
| Goal Type | Top Border Accent |
|-----------|-------------------|
| FIRE | #1D6B3E (green) |
| School fees | #7B3FA0 (purple) |
| Graduation | #C87820 (amber) |
| Marriage | #0B5345 (teal) |
| House | #212F3D (slate) |
| Custom | #212F3D (slate) |

**Data to Fetch:**
- User profile (monthly expense, FIRE target age)
- All goals with current values
- Non-MF assets
- SIP schedules (to determine which dashboard state to show)
- LTCG status

**Acceptance Criteria:**
- [ ] Net worth displays sum of all assets
- [ ] Goal cards show: name, progress bar, current value, gap, status
- [ ] Progress bars color-coded: red <50%, amber 50-90%, green >90%
- [ ] **SIP state renders when user has ≥1 active SIP (confirmation status badges)**
- [ ] **Lumpsum-only state renders when user has 0 SIPs (deployment status panel)**
- [ ] **Panel switches automatically when SIP state changes**
- [ ] Goal cards show correct top-border accent color based on goal type
- [ ] Dashboard loads <2 seconds

---

#### Task 2.3: Create Goal Detail Page
**File:** `/src/pages/GoalDetail.tsx`

Sections (per PRD Screen 2):
1. **Goal Summary Panel** — Target, Lumpsum needed, SIP needed, Invested, Current value, Gap, Progress %, Required CAGR
2. **Combined Projection** — SIP + Lumpsum growth projection
3. **Folio Register Table** — Fund, Alloc%, Lumpsum invested, SIP invested, Current value, Units, SIP status
4. **SIP Tracker Section** — Active SIPs with details
5. **Transaction Log** — Chronological history
6. **Add Transaction Button** — opens modal

**Acceptance Criteria:**
- [ ] All metrics calculate correctly per PRD formulas
- [ ] Lumpsum and SIP tracked separately
- [ ] "Add Transaction" button opens modal
- [ ] Transaction log shows type color-coding

---

#### Task 2.4: Create Add Transaction Modal
**File:** `/src/components/transactions/AddTransactionModal.tsx`

Fields:
- Goal (dropdown, pre-selected if from Goal Detail)
- Fund/Folio (dropdown filtered by goal)
- Transaction Type (segmented: Buy Lumpsum, Buy SIP, Buy STP, Redeem)
- Date picker (default today)
- Amount (₹) — only required manual entry
- NAV (auto-filled, editable)
- Units (calculated, read-only)
- Notes (optional)

**Acceptance Criteria:**
- [ ] NAV auto-fills from API when date selected
- [ ] Units calculate automatically: Amount ÷ NAV
- [ ] Transaction completes in <30 seconds
- [ ] Goal progress updates immediately after save

---

### Phase 3: Goals Management

#### Task 3.1: Create Goals List Page
**File:** `/src/pages/Goals.tsx`

Display all user goals in a grid/list view with:
- Goal name and type badge
- Target corpus and year
- Current progress (progress bar)
- Quick action: Add transaction, Edit goal

**Acceptance Criteria:**
- [ ] All goals displayed with key metrics
- [ ] Clicking goal navigates to Goal Detail
- [ ] "Add Goal" button opens creation modal

---

#### Task 3.2: Create Add New Goal Wizard (3-Step Full Page Flow)
**Files to Create:**
- `/src/pages/goals/AddGoalWizard.tsx` (main container)
- `/src/pages/goals/steps/Step1GoalType.tsx`
- `/src/pages/goals/steps/Step2TargetTimeline.tsx`
- `/src/pages/goals/steps/Step3FundsAllocation.tsx`
- `/src/components/goals/GoalTypeSelector.tsx` (6-card grid component)
- `/src/components/goals/FundAllocationRow.tsx`
- `/src/components/goals/AllocationValidator.tsx`
- `/src/components/goals/InvestmentModeSelector.tsx`

**Access:** From "+ New goal" in topnav OR dashed "+ New goal" card on dashboard. Opens as full-page flow (not modal).

**Step 1 — Goal Type & Name:**
- Goal type grid: 6 cards in 3×2 layout
  - FIRE 🔥 (green accent)
  - School fees 🏫 (purple accent)
  - Graduation 🎓 (amber accent)
  - Marriage 💍 (teal accent)
  - House / down payment 🏡 (green accent)
  - Custom ✦ (slate accent)
- Single select with green border + checkmark on selected
- Goal name field (required) — placeholder: "e.g. Reyaansh Graduation"
- "For" field (optional) — e.g., "Reyaansh", "Kid 2", "Self"

**Step 2 — Target & Timeline:**
- Target corpus ₹ (numeric, yellow input — user-owned, never auto)
  - Form hint: "Your decision — the app never changes this."
- Target year (numeric, e.g., 2037)
- Live indicative projection (appears automatically when both fields filled):
  - Horizon (years remaining)
  - Lumpsum needed today at 12% CAGR
  - Equivalent monthly SIP at 12% CAGR
  - Label: "Indicative — assumes 12% CAGR equity. Not a recommendation."
- Investment mode selector (segmented control):
  - Lumpsum only
  - SIP only
  - Lumpsum + SIP (default)
  - Drives which fields appear in Step 3

**Step 3 — Funds & Allocation:**
- Fund rows (add/remove freely):
  - Each row: Fund name (dropdown), Allocation % (number), Folio number (optional text)
- Allocation Validator (CRITICAL — per PRD UX Principle):
  - Live running total of all allocation % values
  - Coloured status bar below fund rows:
    - Amber: "X% allocated — needs to reach 100%" (when not 100%)
    - Green: "100% allocated ✓" (when exactly 100%)
  - **Save button DISABLED until total = 100%**
- Goal can be created with NO funds initially (user skips fund rows)
- Goal summary preview before save:
  - Goal name, target ₹, target year, investment mode
  - "Save Goal" button (enabled only when allocation = 100% or no funds)
  - Redirects to Goal Detail on save

**Goal Type Color Coding (Drives UI):**
| Goal Type | Border/Accent | Icon BG |
|-----------|--------------|---------|
| FIRE | #1D6B3E (green) | var(--green-l) |
| School fees | #7B3FA0 (purple) | #F5EEF8 |
| Graduation | #C87820 (amber) | var(--amber-l) |
| Marriage | #0B5345 (teal) | var(--green-l) |
| House | #212F3D (slate) | #EAF2FF |
| Custom | #212F3D (slate) | #EAF2FF |

**Acceptance Criteria:**
- [ ] All 3 steps with step indicator at top
- [ ] Step 1: Goal type cards with selection highlight
- [ ] Step 2: Live projection appears when target + year filled
- [ ] Step 2: Investment mode selector (Lumpsum only / SIP only / Both)
- [ ] Step 3: Add/remove fund rows freely
- [ ] Step 3: Allocation validator shows amber when <100%, green at 100%
- [ ] Step 3: Save button disabled until allocation = 100% (or no funds added)
- [ ] Goal created with correct type, target, year, funds, allocation%
- [ ] Redirects to Goal Detail after save
- [ ] Goal type drives accent color on goal card (top border)

---

#### Task 3.3: Create Goal Edit Modal (Simple)
**File:** `/src/components/goals/EditGoalModal.tsx`

**Note:** Goal type is IMMUTABLE after creation (PRD invariant). Changing type would break color coding and historical context. User must delete and recreate to change type.

Editable fields:
- Goal name
- Target corpus (₹) — yellow input, always editable
- Target year
- Notes

**Acceptance Criteria:**
- [ ] Goal type shown as read-only
- [ ] Target corpus never auto-calculated
- [ ] Form validates required fields
- [ ] Updates goal on save

---

#### Task 3.4: Create Folio Management
**File:** `/src/components/folios/FolioModal.tsx`

For manual folio entry (and CAS import assignment):
- Folio number
- Fund selection (searchable dropdown with AMFI codes)
- Allocation % for this goal
- SIP setup (optional): amount, frequency, start date, end date

**Acceptance Criteria:**
- [ ] Folio linked to exactly one goal
- [ ] Allocation % stored correctly
- [ ] SIP details saved if provided

---

### Phase 4: Transactions & SIP

#### Task 4.1: Create Transactions List Page
**File:** `/src/pages/Transactions.tsx`

Full transaction history across all goals with:
- Filter by goal, fund, type, date range
- Search functionality
- Export to CSV button

**Acceptance Criteria:**
- [ ] All transactions listed chronologically
- [ ] Filters work correctly
- [ ] Export generates CSV file

---

#### Task 4.2: Create SIP Manager Page
**File:** `/src/pages/SIPManager.tsx`

Per PRD Screen 5:
- All active SIPs table
- SIP health indicators (missed/confirmed/pending)
- Step-up history per SIP
- Edit SIP functionality (pause, stop, change amount)
- Total monthly SIP commitment display

**Acceptance Criteria:**
- [ ] SIP status shows: active, paused, stopped
- [ ] Health check: red=missed, amber=pending confirm, green=confirmed
- [ ] Step-up history tracked with dates

---

#### Task 4.3: Create SIP Confirmation Flow
**File:** `/src/components/sip/SIPConfirmationCard.tsx`

Monthly SIP confirmation UI:
- Shows pending SIP entries (auto-generated on 1st of month)
- One-tap confirm (if amount same)
- Edit amount option (if stepped up)
- Missed flag if not confirmed by 5th

**Acceptance Criteria:**
- [ ] Pending SIPs appear automatically
- [ ] Confirm records transaction with NAV fetch
- [ ] Edit allows amount change before confirming

---

### Phase 5: LTCG Harvest Tracker

#### Task 5.1: Create Harvest Page
**File:** `/src/pages/Harvest.tsx`

Per PRD Screen 4:
- FY status bar: FY year, Crystallised, Remaining, Estimated tax
- Harvest opportunities list (per folio, sorted by LTCG amount)
- Cross-asset warning panel (for direct equity LTCG)
- Past harvest log
- Log Harvest button

**Acceptance Criteria:**
- [ ] LTCG FIFO calculation correct per PRD
- [ ] ₹1.25L FY limit tracked correctly
- [ ] Remaining room calculates: MAX(0, 125000 − ltcg_fy_total)

---

#### Task 5.2: Create Log Harvest Modal
**File:** `/src/components/harvest/LogHarvestModal.tsx`

Two-step flow:
1. Redeem transaction: select folio, units, calculates LTCG
2. Reinvestment transaction: select destination folio

**Acceptance Criteria:**
- [ ] Calculates LTCG crystallised from FIFO
- [ ] Updates FY running total
- [ ] Records both redeem and reinvestment

---

### Phase 6: Non-MF Assets & Settings

#### Task 6.1: Create Non-MF Assets Manager
**File:** `/src/components/assets/AssetModal.tsx`

Manual entry for:
- EPF balance (with last-updated date)
- NPS balance (with last-updated date)
- Gold (grams/units held, spot price auto-fetches)
- Direct equity
- Emergency fund

**Acceptance Criteria:**
- [ ] All asset types supported
- [ ] Timestamps shown on manual data
- [ ] Gold value auto-calculates from spot price × grams

---

#### Task 6.2: Create Settings Page
**File:** `/src/pages/Settings.tsx`

Sections:
- Profile: name, age, monthly expense, FIRE target age, SWR, inflation
- SIP Schedules: manage all SIPs
- Data Export: Excel/CSV download
- CAS Re-import: upload new CAS PDF
- Alert Preferences: email/in-app toggles

**Acceptance Criteria:**
- [ ] All user profile fields editable
- [ ] Export generates complete data file
- [ ] CAS upload triggers parser

---

### Phase 7: CAS Import (Frontend)

#### Task 7.1: Create CAS Upload Component
**File:** `/src/components/cas/CASUploader.tsx`

Features:
- PDF upload (drag-and-drop + file picker)
- Progress indicator
- Parsing status display
- Review screen: detected folios, funds, transactions
- Confirm/Correct mapping for each folio

**Acceptance Criteria:**
- [ ] Uploads PDF to S3
- [ ] Shows parsing progress
- [ ] User reviews and confirms folio-to-goal assignment

---

## Backend Implementation Tasks (Go + AWS Lambda)

### Phase 1: Infrastructure Setup

#### Task B1.1: AWS CDK Project Setup
**Directory:** `/infrastructure/`

Create CDK stack defining:
- Lambda functions (Go runtime)
- API Gateway (HTTP API)
- Cognito User Pool
- S3 bucket (CAS PDF storage)
- EventBridge rules (cron schedules)
- SES configuration

**Acceptance Criteria:**
- [ ] `cdk deploy` creates all infrastructure
- [ ] Cognito configured for Google OAuth
- [ ] S3 bucket with encryption at rest

---

#### Task B1.2: Go Project Structure
**Directory:** `/backend/`

Structure:
```
/backend/
  /cmd/
    /api/           # API Lambda handler
    /nav-fetch/     # Daily NAV fetch Lambda
    /sip-generator/ # Monthly SIP pending generator
    /cas-parser/    # CAS PDF parser Lambda
  /internal/
    /db/            # Database connection & queries
    /handlers/      # HTTP handlers
    /models/        # Data structures
    /services/      # Business logic
    /amfi/          # AMFI API client
    /calculations/  # FIFO, projections, etc.
  /migrations/      # SQL migrations
  go.mod
```

**Acceptance Criteria:**
- [ ] Go modules initialized
- [ ] Neon serverless driver configured
- [ ] Database migrations setup

---

### Phase 2: Core API Endpoints

#### Task B2.1: User Management API
**Files:** `/backend/internal/handlers/users.go`

Endpoints:
- `GET /api/user` — get current user profile
- `PUT /api/user` — update profile
- `POST /api/user` — create profile (post-auth)

**Acceptance Criteria:**
- [ ] User CRUD operations work
- [ ] Profile fields stored correctly

---

#### Task B2.2: Goals API
**Files:** `/backend/internal/handlers/goals.go`

Endpoints:
- `GET /api/goals` — list all goals for user
- `GET /api/goals/:id` — get goal with calculated metrics
- `POST /api/goals` — create goal
- `PUT /api/goals/:id` — update goal
- `DELETE /api/goals/:id` — delete goal

Calculated metrics to return:
- Current value (sum of folios)
- Lumpsum invested
- SIP invested
- Progress %
- Gap
- Required CAGR

**Acceptance Criteria:**
- [ ] All CRUD endpoints work
- [ ] Calculated fields use PRD formulas
- [ ] Lumpsum and SIP tracked separately

---

#### Task B2.3: Folios API
**Files:** `/backend/internal/handlers/folios.go`

Endpoints:
- `GET /api/folios` — list all folios for user
- `GET /api/goals/:id/folios` — list folios for goal
- `POST /api/folios` — create folio
- `PUT /api/folios/:id` — update folio (inc. SIP changes)
- `DELETE /api/folios/:id` — delete folio

**Acceptance Criteria:**
- [ ] Folio linked to exactly one goal (enforced)
- [ ] SIP history tracked when amount changes

---

#### Task B2.4: Transactions API
**Files:** `/backend/internal/handlers/transactions.go`

Endpoints:
- `GET /api/transactions` — list with filters
- `POST /api/transactions` — create transaction
- `PUT /api/transactions/:id` — update (with limits)
- `DELETE /api/transactions/:id` — soft delete
- `GET /api/transactions/:id/undo` — undo delete (10s window)

**Acceptance Criteria:**
- [ ] Units calculated: Amount ÷ NAV
- [ ] Soft delete with 10s undo window
- [ ] Filters work (goal, fund, type, date range)

---

### Phase 3: NAV & Market Data

#### Task B3.1: AMFI API Client
**Files:** `/backend/internal/amfi/client.go`

Functions:
- `FetchDailyNAVs() []NAVData` — fetch all NAVs from AMFI
- `FetchHistoricalNAV(schemeCode, date) NAVData` — fetch specific date

Sources:
- Daily: `https://www.amfiindia.com/spages/NAVAll.txt` or `https://api.mfapi.in/mf/{schemeCode}`
- Historical: AMFI historical API

**Acceptance Criteria:**
- [ ] Parses AMFI response correctly
- [ ] Handles weekend/holiday (returns previous business day)
- [ ] Stores NAV with 3 decimal precision

---

#### Task B3.2: Daily NAV Fetch Lambda
**Files:** `/backend/cmd/nav-fetch/main.go`

Triggered by: EventBridge cron at 6:30 PM IST (13:00 UTC)

Flow:
1. Fetch all funds from DB
2. Call AMFI API for each fund
3. Upsert into nav_history table
4. Log results

**Acceptance Criteria:**
- [ ] Runs daily at scheduled time
- [ ] Updates all fund NAVs
- [ ] Handles API failures gracefully

---

#### Task B3.3: On-Demand NAV API
**Files:** `/backend/internal/handlers/nav.go`

Endpoint: `GET /api/nav?fundId=X&date=YYYY-MM-DD`

Returns:
- NAV for requested or previous available date
- Source (AMFI_DAILY, AMFI_HISTORICAL, MANUAL)
- Actual date of NAV (if different from requested)

**Acceptance Criteria:**
- [ ] Returns NAV within 2 seconds
- [ ] Falls back to previous business day if needed

---

### Phase 4: SIP & Automation

#### Task B4.1: SIP History Tracking
**Files:** `/backend/internal/services/sip.go`

When SIP amount changes:
- Close previous sip_history record (set effective_to)
- Create new sip_history record (effective_from = today)

**Acceptance Criteria:**
- [ ] SIP step-ups tracked with effective dates
- [ ] Historical SIP totals calculate correctly

---

#### Task B4.2: Monthly SIP Generator Lambda
**Files:** `/backend/cmd/sip-generator/main.go`

Triggered by: EventBridge cron on 1st of month

Flow:
1. Find all active SIPs (sip_active = true, sip_end_date IS NULL OR > today)
2. Create pending transaction for each:
   - type: BUY_SIP
   - source: SIP_PENDING
   - amount: current sip_amount
   - txn_date: 1st of month (or sip_start_date if later)

**Acceptance Criteria:**
- [ ] Creates pending SIP entries on 1st of month
- [ ] Only for active, non-ended SIPs
- [ ] Uses current SIP amount from folio

---

#### Task B4.3: SIP Confirmation API
**Files:** `/backend/internal/handlers/sip.go`

Endpoints:
- `GET /api/sip/pending` — list pending SIP confirmations for user
- `POST /api/sip/confirm/:pendingId` — confirm with optional amount override

On confirm:
- Update transaction with actual amount
- Fetch NAV for date
- Calculate units
- Change source to SIP_CONFIRMED

**Acceptance Criteria:**
- [ ] Pending SIPs listed for user
- [ ] Confirm updates with NAV and units
- [ ] Amount override updates folio's SIP amount and creates sip_history entry

---

### Phase 5: LTCG & Calculations

#### Task B5.1: FIFO LTCG Calculation Service
**Files:** `/backend/internal/calculations/fifo.go`

Functions:
- `CalculateLTCG(folioID) []Tranche` — returns unrealized LTCG per tranche
- `CalculateHarvestUnits(folioID, desiredLTCG) units` — units to redeem for target LTCG
- `ProcessRedemption(folioID, units, date) LTCGResult` — FIFO consumption on redeem

FIFO Logic:
- Sort all BUY transactions by date ASC
- For redemption, consume oldest tranches first
- Track units remaining per tranche
- LTCG = (Current NAV − Purchase NAV) × units, if >365 days

**Acceptance Criteria:**
- [ ] Unit tests for: partial redemption, full redemption, multiple tranches
- [ ] LTCG correctly identified: >365 days = LTCG, else STCG

---

#### Task B5.2: LTCG Tracker API
**Files:** `/backend/internal/handlers/ltcg.go`

Endpoints:
- `GET /api/ltcg/status` — FY status: crystallised, remaining, estimated tax
- `GET /api/ltcg/opportunities` — list folios with harvestable LTCG
- `POST /api/ltcg/harvest` — log a harvest (redeem + optional reinvest)

**Acceptance Criteria:**
- [ ] FY tracked correctly (Apr-Mar)
- [ ] ₹1.25L limit enforced
- [ ] Tax calculated: MAX(0, cum_total − 125000) × 0.125

---

#### Task B5.3: LTCG Alert Lambda
**Files:** `/backend/cmd/ltcg-alert/main.go`

Triggered by: EventBridge cron on February 1

Flow:
1. For each user, calculate total LTCG available to harvest
2. If > ₹10,000, send SES email + create in-app notification
3. In-app banner visible Feb-Mar

**Acceptance Criteria:**
- [ ] Triggers Feb 1
- [ ] Email sent to qualifying users
- [ ] In-app banner created

---

### Phase 6: CAS Import

#### Task B6.1: CAS PDF Parser Lambda
**Files:** `/backend/cmd/cas-parser/main.go`

Triggered by: S3 event on PDF upload

Libraries: `pdfcpu` or `unipdf` for Go

Flow:
1. Download PDF from S3
2. Extract text from PDF
3. Parse CAMS or KFintech format
4. Extract: folios, funds, transactions (dates, amounts, NAVs, units, types)
5. Match funds to existing fund master data (by ISIN/name)
6. Store parsed data in temporary table
7. Call frontend webhook or mark for review

**Acceptance Criteria:**
- [ ] Handles both CAMS and KFintech formats
- [ ] Extracts all transaction types (Buy, SIP, Redeem, Switch)
- [ ] Tags SIP transactions correctly vs Lumpsum

---

#### Task B6.2: CAS Import API
**Files:** `/backend/internal/handlers/cas.go`

Endpoints:
- `GET /api/cas/pending` — get parsed CAS data for review
- `POST /api/cas/confirm` — confirm import, create folios & transactions
- `POST /api/cas/reject` — discard parsed data

On confirm:
- Create folios for new folio numbers
- Assign to goals (user provides mapping)
- Create all transactions
- Tag SIPs correctly

**Acceptance Criteria:**
- [ ] User reviews before importing
- [ ] Goal assignment done during review
- [ ] Historical SIPs tagged BUY_SIP

---

### Phase 7: Additional Features

#### Task B7.1: Goal Projection Calculations
**Files:** `/backend/internal/calculations/projections.go`

Formulas per PRD:
- Lumpsum projected value = lumpsum_invested × (1+r)^n
- SIP projected value = PMT × ((1+r)^n − 1) / r × (1+r)
- Required CAGR = (Target ÷ Current)^(1/horizon) − 1
- SIP needed (monthly) = PMT(r/12, months, −shortfall)

**Acceptance Criteria:**
- [ ] Projections calculate correctly
- [ ] Required CAGR accurate

---

#### Task B7.2: Glide Path Alert Lambda
**Files:** `/backend/cmd/glide-path-alert/main.go`

Triggered by: EventBridge daily

Flow:
1. Check for goals where (target_year − current_year) ≤ 3
2. If not already alerted for this goal, send alert
3. Store alert sent flag

Message: "Move X to debt — 3 years to drawdown for [Goal Name]"

**Acceptance Criteria:**
- [ ] Detects T-3 year goals
- [ ] Sends email + in-app notification
- [ ] Doesn't duplicate alerts

---

#### Task B7.3: Data Export API
**Files:** `/backend/internal/handlers/export.go`

Endpoints:
- `GET /api/export/csv` — full data export as CSV
- `GET /api/export/excel` — full data export as Excel

Include:
- User profile
- Goals
- Folios
- Transactions (SIP vs Lumpsum labeled)
- Non-MF assets
- LTCG harvest records

**Acceptance Criteria:**
- [ ] Export includes all user data
- [ ] SIP transactions labeled separately
- [ ] File formats valid

---

## PRD v3 Acceptance Criteria (NEW)

> **🔄 UPDATED:** 5 new acceptance criteria added for flows introduced in UI v3.

### New Criteria — Phase 1

| **Criterion** | **Test** |
|---------------|----------|
| **Onboarding wizard completes end-to-end** | New user signs in → completes all 9 steps → dashboard populates with entered data, correct NAVs, correct goal progress calculations. Zero manual steps required after Step 9. |
| **Lumpsum-only dashboard renders correctly** | Create a user with goals but 0 SIP transactions → dashboard shows lumpsum deployment status panel, not SIP confirmation panel. Add 1 SIP transaction → panel switches to SIP state automatically without page refresh. |
| **Add New Goal wizard saves correctly** | Complete 3-step wizard → goal appears in Goals list → goal detail shows correct target, year, fund allocation, investment mode. Folio register shows all entered funds at correct allocation %. |
| **Allocation validator blocks invalid save** | In Step 3 of Add New Goal wizard: add 2 funds at 40% + 40% = 80% → save button is disabled, amber warning shows "80% allocated — needs to reach 100%". Change second fund to 60% → total = 100% → save button enables, green confirmation shows. |
| **Goal type drives correct UI** | Create a FIRE goal → card shows green top border. Create a Graduation goal → card shows amber top border. Create a Marriage goal → card shows correct colour. Goal type icon appears in card header and goal detail heading. |

### Updated Invariants

Two new invariants added to the 8 existing invariants:

1. **Dashboard cashflow panel always reflects the current SIP state** — never shows SIP panel with 0 SIPs, never shows lumpsum panel when SIPs exist

2. **Goal type is immutable after creation** — changing a FIRE goal to a Marriage goal is not allowed (would break colour coding, default behaviours, and historical context). User must delete and recreate.

---

## Implementation Order (Recommended)

### Week 1-2: Foundation
1. AWS CDK infrastructure setup
2. Database schema creation
3. Go backend project scaffold
4. Frontend auth context & login page
5. Protected routes

### Week 3-4: Core Goals & Folios
6. User profile API
7. Goals CRUD API
8. Folios CRUD API
9. Dashboard page (basic)
10. Goals list & detail pages

### Week 5-6: Transactions & NAV
11. AMFI API client
12. Daily NAV fetch Lambda
13. Transactions CRUD API
14. Add Transaction modal
15. On-demand NAV endpoint

### Week 7-8: SIP Module
16. SIP history tracking
17. Monthly SIP generator Lambda
18. SIP confirmation flow
19. SIP Manager page
20. Goal projections (SIP + Lumpsum)

### Week 9-10: LTCG & Calculations
21. FIFO LTCG calculation service
22. LTCG Tracker API
23. Harvest page
24. LTCG alert Lambda
25. Glide path alert Lambda

### Week 11-12: Import & Polish
26. CAS PDF parser Lambda
27. CAS upload & review UI
28. Non-MF assets management
29. Settings page
30. Data export

### Week 13-14: Testing & Refinement
31. End-to-end testing
32. Performance optimization
33. Bug fixes
34. Documentation

---

## Key Implementation Notes

### Money Storage (CRITICAL)
- All ₹ amounts stored as **INTEGER in paise** (₹1 = 100 paise)
- NAV stored as **INTEGER in paise × 1000** (for 3 decimal precision)
- Never use float for money calculations

### Indian FY Handling
- FY = April 1 to March 31
- Helper function: `getIndianFY(date) → "2025-26"`
- LTCG FY resets automatically April 1

### Lambda + Neon Connection
- Use Neon's serverless HTTP driver (not TCP)
- Avoids connection exhaustion across Lambda instances

### CAS Parser Testing
- Test with 20+ real CAS samples before shipping
- Handle encoding variations between CAMS/KFintech

---

## Frontend-Backend API Contract

### Authentication
All API calls include Cognito JWT in `Authorization: Bearer <token>` header

### Response Format
```json
{
  "data": { ... },
  "error": null,
  "meta": { "page", "total", etc. }
}
```

### Error Format
```json
{
  "data": null,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Amount must be positive integer in paise"
  }
}
```

### Common Query Parameters
- `?goal_id=` — filter by goal
- `?fund_id=` — filter by fund
- `?type=` — filter by transaction type
- `?from=` & `?to=` — date range
- `?page=` & `?limit=` — pagination

---

## Environment Variables

### Frontend (.env)
```
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_API_GATEWAY_URL=
VITE_GOOGLE_CLIENT_ID=
```

### Backend (Lambda env vars)
```
NEON_DATABASE_URL=
COGNITO_USER_POOL_ID=
COGNITO_REGION=
S3_BUCKET_NAME=
SES_FROM_EMAIL=
AMFI_API_URL=
```

---

## End of Task Document

*This document provides the complete step-by-step guide for implementing WealthTrack alongside the existing FireCal and Tax Harvesting Calculator.*
