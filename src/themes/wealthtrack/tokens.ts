// ============================================================
// WEALTHTRACK DESIGN TOKENS
// Source of truth: wealthtrack_v3.html
// Every value here is copied exactly from the HTML :root and
// CSS classes. No component may hardcode any of these values.
// ============================================================

export const tokens = {

  // ----------------------------------------------------------
  // COLORS
  // ----------------------------------------------------------
  colors: {

    // Core nature palette (from HTML :root)
    pine:   '#1A3A28',   // --pine   · deepest bg, pine glass bg base
    forest: '#2D5A40',   // --forest · btn-primary gradient start
    sage:   '#4A8060',   // --sage   · input focus border
    mint:   '#7BB89A',   // --mint   · active nav, live indicators, orb tints
    foam:   '#C8E6D4',   // --foam   · light tints
    mist:   '#EEF7F2',   // --mist   · lightest surfaces

    // Page background (from HTML --bg-page)
    bgPage: '#0F2A1C',

    // Ink / text (from HTML --ink, --ink2, --ink3)
    ink:  '#1A2E20',     // --ink  · primary text on light glass
    ink2: '#4A6654',     // --ink2 · secondary / muted text
    ink3: '#8AA896',     // --ink3 · hint / placeholder / label text

    // Semantic (from HTML --green, --amber, --red, --blue)
    green:      '#1D6B3E',
    greenLight: '#D4EDDE',
    amber:      '#8B5E0A',
    amberLight: '#FEF3DC',
    red:        '#8B2020',
    redLight:   '#FCEAEA',
    blue:       '#1A4A8A',
    blueLight:  '#E0EDFB',

    // Glass (from HTML :root glass vars + .glass / .glass-dark / .glass-pine)
    glass: {
      bg:         'rgba(255,255,255,0.62)',   // .glass background
      bgDark:     'rgba(255,255,255,0.42)',   // .glass-dark background
      bgPine:     'rgba(26,58,40,0.55)',      // .glass-pine background
      border:     'rgba(255,255,255,0.75)',   // .glass border
      borderDark: 'rgba(255,255,255,0.50)',   // .glass-dark border
      borderPine: 'rgba(123,184,154,0.25)',   // .glass-pine border
    },

    // Orb tints (from HTML .orb CSS)
    orb: {
      1: 'rgba(74,128,96,0.25)',
      2: 'rgba(29,107,62,0.20)',
      3: 'rgba(123,184,154,0.18)',
    },

    // Feature icon box (from HTML left panel feature rows)
    featureIcon: {
      bg:     'rgba(123,184,154,0.15)',
      border: 'rgba(123,184,154,0.25)',
    },

    // Divider (from HTML .divider)
    divider:      'rgba(74,102,84,0.12)',
    dividerLight: 'rgba(74,102,84,0.15)',

    // Progress gradients (from HTML .pf-green / .pf-amber / .pf-red)
    progress: {
      green: { from: '#2D8A50', to: '#4ade80' },
      amber: { from: '#C87820', to: '#FBBF24' },
      red:   { from: '#C02020', to: '#F87171' },
    },

    // Transaction type colours (from HTML inline badges)
    transaction: {
      buyLumpsum: '#2563EB',
      buySip:     '#1D6B3E',
      buyStp:     '#7C3AED',
      redeem:     '#DC2626',
      switchIn:   '#EA580C',
      dividend:   '#0891B2',
    },

    // Topbar (from HTML .topbar)
    topbar: {
      bg:     'rgba(15,42,28,0.70)',
      border: 'rgba(123,184,154,0.20)',
      navActive: 'rgba(123,184,154,0.20)',
      navHover:  'rgba(255,255,255,0.10)',
    },

    // Buttons
    button: {
      primaryFrom:      '#2D8A50',   // .btn-primary gradient start
      primaryTo:        '#1D6B3E',   // .btn-primary gradient end
      primaryHoverFrom: '#349458',
      primaryHoverTo:   '#237A46',
      primaryBorder:    'rgba(255,255,255,0.15)',
      glass:            'rgba(255,255,255,0.65)',   // .btn-glass
      glassBorder:      'rgba(255,255,255,0.80)',
      glassHover:       'rgba(255,255,255,0.85)',
      outlineLight:     'rgba(255,255,255,0.10)',   // .btn-outline-light
      outlineLightBorder: 'rgba(255,255,255,0.30)',
      googleBg:         'rgba(255,255,255,0.90)',
      googleBorder:     'rgba(74,102,84,0.25)',
      googleHover:      'rgba(255,255,255,1.00)',
    },

    // Form inputs (from HTML .form-input)
    input: {
      bg:          'rgba(255,255,255,0.85)',
      bgFocus:     'rgba(255,255,255,0.95)',
      border:      'rgba(74,102,84,0.20)',
      borderFocus: '#4A8060',          // --sage
      ring:        'rgba(74,128,96,0.15)',
    },

    // Onboarding inputs (from HTML .ob-input — dark theme)
    obInput: {
      bg:          'rgba(255,255,255,0.10)',
      bgFocus:     'rgba(255,255,255,0.15)',
      border:      'rgba(255,255,255,0.20)',
      borderFocus: 'rgba(123,184,154,0.60)',
      ring:        'rgba(123,184,154,0.15)',
      text:        '#FFFFFF',
      placeholder: 'rgba(255,255,255,0.35)',
    },

    // Onboarding choice cards (from HTML .ob-choice)
    obChoice: {
      bg:           'rgba(255,255,255,0.08)',
      border:       'rgba(255,255,255,0.15)',
      bgHover:      'rgba(255,255,255,0.15)',
      borderHover:  'rgba(255,255,255,0.30)',
      bgSelected:   'rgba(123,184,154,0.20)',
      borderSelected: 'rgba(123,184,154,0.50)',
    },

    // Nav confirm chip (from HTML .nav-confirm)
    navConfirm: {
      bg:     'rgba(74,128,96,0.15)',
      border: 'rgba(74,128,96,0.25)',
      text:   '#4A8060',   // --sage
    },

    // Live dot in topbar
    liveDot: '#4ade80',

    // Goal type accent colours (from HTML goal-card border-top)
    goalAccent: {
      FIRE:       '#1D6B3E',
      SCHOOL:     '#7B3FA0',
      GRADUATION: '#C87820',
      MARRIAGE_1: '#0B5345',
      MARRIAGE_2: '#78281F',
      WHITE_GOODS:'#212F3D',
      CUSTOM:     '#212F3D',
    },
  },

  // ----------------------------------------------------------
  // TYPOGRAPHY
  // Font families exactly as declared in the HTML <link> and CSS
  // ----------------------------------------------------------
  typography: {
    fontFamily: {
      sans:  "'DM Sans', system-ui, -apple-system, sans-serif",
      mono:  "'DM Mono', Menlo, Monaco, monospace",
      serif: "'Cormorant Garamond', Georgia, serif",
    },

    // Sizes used in the HTML (px values)
    fontSize: {
      '10': '10px',    // smallest labels
      '11': '11px',    // .label text-transform uppercase, legal note
      '12': '12px',    // .hint, .form-label, .form-hint
      '13': '13px',    // body small, table cells, feature text, nav
      '14': '14px',    // body default (HTML body font-size)
      '15': '15px',    // .btn-lg font-size
      '16': '16px',    // metric values in glass panels
      '17': '17px',    // inner h2 (e.g. "Welcome back" in card is 20px)
      '18': '18px',    // goal card values
      '19': '19px',    // goal card large values
      '20': '20px',    // card h2 "Welcome back", metric-box values
      '22': '22px',    // page h1
      '26': '26px',    // inner h2 headings
      '28': '28px',    // FIRE corpus number in panel
      '30': '30px',    // FIRE corpus number variant
      '32': '32px',    // onboarding question, tagline
      '36': '36px',    // logo serif
      '38': '38px',    // net worth large number
    },

    fontWeight: {
      light:  '300',
      normal: '400',
      medium: '500',   // primary weight — used for most headings and buttons
      // Note: HTML uses max 500 weight. 600/700 not used in design.
    },

    lineHeight: {
      none:    '1',
      tight:   '1.1',
      snug:    '1.25',
      heading: '1.3',   // tagline, question text
      body:    '1.55',  // HTML body line-height
      relaxed: '1.6',   // trust note, sub text
      loose:   '1.8',   // feature description paragraph
    },

    letterSpacing: {
      tight:  '-0.02em',  // logo serif
      label:  '0.05em',   // .label (uppercase small caps)
      normal: '0',
    },
  },

  // ----------------------------------------------------------
  // BORDER RADIUS
  // Exactly from HTML :root --r-sm / --r / --r-lg
  // ----------------------------------------------------------
  borderRadius: {
    none: '0',
    sm:   '8px',   // --r-sm · inputs, badges, inner elements
    md:   '12px',  // --r    · buttons, standard cards
    lg:   '18px',  // --r-lg · glass cards, main panels
    xl:   '24px',
    full: '9999px', // pills, avatar, live dot
  },

  // ----------------------------------------------------------
  // SHADOWS
  // Exactly from HTML --glass-shadow and btn shadows
  // ----------------------------------------------------------
  shadows: {
    glass:        '0 8px 32px rgba(26,58,40,0.12), 0 2px 8px rgba(26,58,40,0.08)',  // --glass-shadow
    glassHover:   '0 12px 40px rgba(26,58,40,0.18)',
    pine:         '0 12px 40px rgba(0,0,0,0.25)',    // .glass-pine box-shadow
    button:       '0 2px 8px rgba(29,107,62,0.30)',  // .btn-primary
    buttonHover:  '0 4px 12px rgba(29,107,62,0.40)',
    focus:        '0 0 0 3px rgba(74,128,96,0.15)',  // input focus ring
  },

  // ----------------------------------------------------------
  // BLUR
  // From HTML --glass-blur and .glass-pine
  // ----------------------------------------------------------
  blur: {
    glass:  'blur(18px) saturate(160%)',  // --glass-blur · .glass, .glass-dark
    pine:   'blur(20px) saturate(180%)',  // .glass-pine
    orb:    'blur(60px)',                 // .orb
    button: 'blur(8px)',                  // .btn-glass, .form-input
  },

  // ----------------------------------------------------------
  // SPACING (rem scale matching Tailwind defaults)
  // ----------------------------------------------------------
  spacing: {
    px:   '1px',
    0:    '0',
    0.5:  '0.125rem',
    1:    '0.25rem',
    1.5:  '0.375rem',
    2:    '0.5rem',
    2.5:  '0.625rem',
    3:    '0.75rem',
    3.5:  '0.875rem',
    4:    '1rem',
    5:    '1.25rem',
    6:    '1.5rem',
    7:    '1.75rem',
    8:    '2rem',
    9:    '2.25rem',
    10:   '2.5rem',
    12:   '3rem',
    14:   '3.5rem',
    16:   '4rem',
    20:   '5rem',
    24:   '6rem',
    28:   '7rem',
    32:   '8rem',
    36:   '9rem',
    40:   '10rem',
    48:   '12rem',
    60:   '15rem',
    64:   '16rem',
  },

  // ----------------------------------------------------------
  // Z-INDEX
  // ----------------------------------------------------------
  zIndex: {
    orb:      0,
    content:  1,
    topbar:   50,
    dropdown: 100,
    modal:    300,
    toast:    600,
  },

  // ----------------------------------------------------------
  // TRANSITIONS (from HTML transition: all .15s / .18s / .2s)
  // ----------------------------------------------------------
  transition: {
    fast:    '150ms cubic-bezier(0.4, 0, 0.2, 1)',   // .15s — buttons, links
    default: '200ms cubic-bezier(0.4, 0, 0.2, 1)',   // .2s  — inputs, cards
    slow:    '300ms cubic-bezier(0.4, 0, 0.2, 1)',   // .3s  — progress bars
  },

  // ----------------------------------------------------------
  // BACKGROUND MESH
  // Exact gradient string from HTML .bg-mesh
  // ----------------------------------------------------------
  bgMesh: `
    radial-gradient(ellipse 80% 60% at 20% 10%, rgba(74,128,96,0.35) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 80% 90%, rgba(45,90,64,0.40) 0%, transparent 60%),
    radial-gradient(ellipse 70% 50% at 60% 40%, rgba(123,184,154,0.15) 0%, transparent 55%),
    linear-gradient(160deg, #0F2A1C 0%, #162F22 40%, #0C1F15 100%)
  `.trim(),

  // ----------------------------------------------------------
  // ORBS
  // Exact values from HTML .orb1 / .orb2 / .orb3
  // ----------------------------------------------------------
  orbs: [
    { width: '420px', height: '420px', bg: 'rgba(74,128,96,0.25)',   top: '-80px',  left: '-100px', right: 'auto', bottom: 'auto', duration: '22s', delay: '0s'  },
    { width: '320px', height: '320px', bg: 'rgba(29,107,62,0.20)',   top: 'auto',   left: 'auto',   right: '-80px', bottom: '-60px', duration: '16s', delay: '-8s' },
    { width: '200px', height: '200px', bg: 'rgba(123,184,154,0.18)', top: '40%',    left: '60%',    right: 'auto', bottom: 'auto', duration: '20s', delay: '-4s' },
  ],

  // ----------------------------------------------------------
  // SIZES — specific fixed dimensions used in the HTML
  // ----------------------------------------------------------
  sizes: {
    topbarHeight:     '54px',
    featureIconSize:  '28px',
    avatarSize:       '32px',
    liveDotSize:      '6px',
    authCardWidth:    '460px',   // right panel card width in HTML
    authCardPadding:  '36px',    // glass card padding
    leftPanelPadding: '60px 64px', // left brand panel padding
    rightPanelPadding:'40px 48px', // right panel padding
  },

} as const;

// ----------------------------------------------------------
// TYPE EXPORTS
// ----------------------------------------------------------
export type Tokens       = typeof tokens;
export type Colors       = Tokens['colors'];
export type Typography   = Tokens['typography'];
export type Spacing      = Tokens['spacing'];
export type BorderRadius = Tokens['borderRadius'];
export type Shadows      = Tokens['shadows'];
export type Blur         = Tokens['blur'];
export type Transition   = Tokens['transition'];
