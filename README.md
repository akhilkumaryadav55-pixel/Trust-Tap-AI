# TrustTap AI — Intelligent Scam Detection and Digital Safety Assistant

**Pause. Check. Protect.**

A Next.js 16, React 19, TypeScript and Tailwind CSS 4 application that helps
people check suspicious messages, screenshots and URLs before they interact
with them.

- **Built for India first**, with primary English and Hindi localization.
- **Works with zero credentials.** The default build runs a deterministic,
  rule-based analysis engine and clearly labels every degraded capability in
  the UI. Optional AI, Google Safe Browsing and Supabase cloud persistence can
  be turned on later.
- **Privacy-first.** Raw message text and screenshots are not stored by default;
  screenshots are processed in memory only. Saved checks keep the category, risk
  result and a redacted excerpt.
- **Honest by design.** It never says a URL was verified unless a real
  reputation check ran, and it never calls a result "definitely safe" — only
  "no obvious red flags found" or "unable to assess."

> **What it does:** tells you what the submitted content appears to be, which
> warning signs it found, why each one matters, how confident it is, what to do
> next, and which official Indian resources may help.
>
> **What it does not do:** it is not a bank, police, government service or
> substitute for professional cybersecurity investigation. It never contacts
> anyone on your behalf.

---

## What you get

TrustTap AI has a complete set of screens:

- **Welcome / onboarding** — short explanation, privacy notice, English/Hindi
  selection, a clearly-labelled practice example, and a "Get Started" entry to
  the dashboard.
- **Dashboard** — sticky header with language and theme controls, a large
  text-analyzer input, content-type and explanation-language selectors, a
  primary "Check for Scams" button, a screenshot-upload option, a URL-check
  option, an emergency-help shortcut, Safety Center, Learning Center, Saved
  checks and Settings. It also shows the current engine status: rule-engine
  only, AI interpretation, reputation lookup and cloud persistence.
- **Message analyzer** — multiline paste input, content-type selector, language
  selector, privacy notice, and a reasonable maximum length guard. The engine
  auto-detects Hindi/English content and redacts sensitive values such as OTPs,
  UPI PINs and card-like numbers before analysis.
- **Screenshot analyzer** — upload PNG/JPG/WEBP/HEIC up to 5 MB, browser-side
  MIME and content validation, preview, local OCR via Tesseract with an optional
  AI-vision fallback, a user correction step before analysis, and clear errors
  when extraction fails.
- **URL checker** — paste a URL and get offline structural analysis (lookalike
  domains, IP hosts, link shorteners, unusual subdomains, punycode, loose TLDs,
  path vocabulary, explicit brand lookalike and official-suffix detection). The
  server never visits the URL. When configured, an optional Google Safe Browsing
  lookup is performed against the allowlisted provider hostname only.
- **Analysis results** — risk category, indicative risk score with a plain
  disclaimer, a plain-language summary, each warning sign with its evidence and
  explanation, recommended actions, actions to avoid, uncertainties, and
  allowlisted official resources. Also supported: "Unable to Assess" and
  "Unable to assess" states when the content is too short or an essential
  service failed.
- **Incident-response assistant** — choose what happened and get tailored next
  steps. For suspected Indian financial fraud, the national cybercrime helpline
  1930 and the national Cyber Crime Reporting Portal are prominent. The app
  never claims it contacted a bank, froze money or filed a report.
- **India Safety Center** — 1930, cybercrime.gov.in, Sanchar Saathi,
  bank/payment-provider guidance, evidence-preservation steps and account
  security guidance. External government resources are clearly labelled.
- **Learning Center** — educational topics such as fake job/internship offers,
  fake scholarships, phishing, fake bank KYC messages, UPI tricks, impersonation,
  fake delivery-fee requests, QR-payment risks, investment/crypto scams,
  remote-access app scams, OTP/social-engineering attacks, fake support numbers
  and AI-generated impersonation.
- **Saved checks** — device-local history when enabled, with open and delete
  actions, a delete-all option, and an export option.
- **Account and privacy settings** — language, theme, history-saving preference,
  data deletion, privacy notice, AI limitations, feedback contact and export.

---

## Architecture

The pipeline is modular and degrades gracefully:

1. input validation and sanitization
2. content classification (auto-detect language and content type)
3. rule-based indicators from a tested, maintainable rule catalog
4. optional offline URL structure analysis for any link in the submission
5. optional external URL reputation lookup, only against an allowlisted provider
6. optional AI interpretation behind a server-only provider interface with a
   strict Zod output schema, prompt-injection defence and a structured-output
   guard
7. risk aggregation with documented scoring, including a URL-structure block,
   combination bonuses, a hard OTP/credential floor, and a cap so three
   near-duplicate rules cannot manufacture a high-risk verdict
8. localize the narrative in English or Hindi
9. allowlisted official resources only — never model-invented links

Persistent storage lives either in the browser (local device mode) or in Supabase
PostgreSQL when configured. The data model is small and privacy-conscious:
`analyses`, optional `users`, and optional `user_reports`.

---

## Getting started on your machine

### Prerequisites

- Node.js 18 or later (this project uses Next.js 16 with Turbopack)
- npm 9 or later

Node is all you need for the default, zero-credential build.

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`. The app auto-reloads as you edit.

To stop it:

```bash
# If you started it the normal way, Ctrl+C in the terminal that is running it.
# If you need to kill a lingering process, the easiest cross-platform form is:
pkill -f "next dev" || true
```

### 3. Recommended first look

1. Open the welcome screen and press **Get Started**.
2. On the dashboard, paste a scam-like message such as:
   `Dear Customer, your KYC will expire today. Update immediately or your account
   will be blocked. Share the OTP you receive to verify. Pay Rs 499 processing
   fee.`
3. Choose "Banking or payment message" and "English", then press **Check for Scams**.
4. Visit the results screen and read the findings, recommended actions and official
   resources.
5. Try the link checker with `http://sbi-kyc-update.xyz/verify`.
6. Try the Hindi input `प्रिय ग्राहक, आपका खाता बंद हो जाएगा। तुरंत ओटीपी बताएँ।`
   with explanation language set to Hindi.

### 4. Running tests and type checking

```bash
npm run test        # unit + integration tests (engine, rules, URL, sensitive, AI schema)
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run verify      # all four in sequence
```

---

## File layout

```
.
├── .env.example          # template for optional credentials
├── next.config.ts        # Next.js config + security headers
├── package.json
├── postcss.config.mjs    # Tailwind CSS 4 integration
├── tsconfig.json
├── public/
│   ├── sw.js             # service worker
│   ├── offline.html      # offline fallback
│   └── icons/           # PWA icons (generated)
├── src/
│   ├── app/
│   │   ├── api/          # route handlers: analyze, url-check, extract-text, analyses, health
│   │   ├── check/        # screens C, D, E
│   │   ├── results/      # screen F
│   │   ├── emergency/    # screen G
│   │   ├── safety-center/# screen H
│   │   ├── learn/        # screen I
│   │   ├── saved/        # screen J
│   │   ├── settings/     # screen K
│   │   ├── welcome/      # screen A
│   │   ├── page.tsx      # screen B dashboard
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/           # button, surfaces, form, risk components
│   │   ├── shell/        # app shell, service worker registration
│   │   ├── analysis/     # message form, result view, use-analyzer hook
│   │   ├── learn/        # topic view
│   │   └── providers/    # app-level providers
│   ├── lib/
│   │   ├── analysis/     # engine, rules, scoring, ai, url, reputation, classify, summary
│   │   ├── content/      # resources, incident, learning, samples
│   │   ├── http/         # rate limiting, respond
│   │   ├── storage/      # supabase, local, store
│   │   ├── i18n/         # en, hi dictionaries
│   │   ├── env.ts        # server-side env + capability derivation
│   │   └── ...
│   └── ...
├── scripts/
│   ├── smoke.mjs         # end-to-end smoke test
│   ├── start-dev.mjs     # dev server starter
│   └── screenshots.mjs   # screenshot generator (requires Playwright)
├── tests/                # unit + integration tests
└── supabase/migrations/  # initial DB migration
```

---

## Environment variables

Every variable in `.env.example` is optional. TrustTap AI is designed to run
end-to-end with none of them set: it falls back to the rule-based engine and
labels every absent capability honestly.

Copy the template and fill in what you have:

```bash
cp .env.example .env.local
```

Key variables:

- `NEXT_PUBLIC_APP_URL` — public base URL, used for canonical metadata and the PWA manifest.
- `AI_API_KEY` — server-side AI provider key. Leave empty for rule-engine-only mode.
- `AI_BASE_URL` — OpenAI-compatible base URL, e.g. `https://api.openai.com/v1`,
  `https://openrouter.ai/api/v1`, or `http://localhost:11434/v1` for Ollama.
- `AI_MODEL` — text model, default `gpt-4o-mini`.
- `AI_VISION_MODEL` — optional vision-capable model for screenshot OCR.
- `AI_TIMEOUT_MS` — per-request AI timeout, default 20000.
- `SAFE_BROWSING_API_KEY` — optional Google Safe Browsing key.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never exposed to the browser.
- `RATE_LIMIT_PER_MINUTE`, `MAX_MESSAGE_CHARS`, `MAX_UPLOAD_BYTES` — operational
  limits with sensible defaults.

Never commit a real `.env` file. `.env*` is git-ignored.

---

## Screenshots

Dashboard (dark mode, mobile first):

![Dashboard](screenshots/dashboard.png)

Results for a scam-like message:

![Results](screenshots/results.png)

You can generate current screenshots from the running app:

```bash
npm run dev
# then in another terminal:
node scripts/screenshots.mjs
```

Screenshots land in `screenshots/`.

---

## Optional integrations

### AI provider

When `AI_API_KEY` is set, the server asks a configurable OpenAI-compatible model
for a structured analysis. The prompt tells the model to treat the submission as
untrusted evidence, never to reveal credentials, never to invent facts, and to
follow a strict schema. Every response is validated against Zod before it reaches
the UI. If the AI is not configured, the UI reports "AI interpretation: not
configured" instead of pretending one ran.

Any OpenAI-compatible endpoint works. The same key can target OpenAI, Azure OpenAI,
Groq, Together, OpenRouter or a local server such as Ollama, as long as it speaks
the Chat Completions format.

### Google Safe Browsing

When `SAFE_BROWSING_API_KEY` is set, the URL checker performs an optional
reputation lookup against a fixed, allowlisted provider hostname. The provider
never receives the submitted address unless the lookup is actually performed, and
the UI reports explicitly whether the check ran.

### Supabase

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set,
saved checks and accounts move to PostgreSQL. The service-role key stays server-side
only. Row-level security must restrict users to their own records. The initial
migration lives in `supabase/migrations/0001_init.sql`.

---

## Deployment

The app is a standard Next.js app with App Router route handlers. Build it once,
then deploy the output to any supported Next.js hosting target.

```bash
npm run build
npm start
```

The included `next.config.ts` sets security headers globally (CSP, frame
ancestors denied, no-sniff, referrer policy, permissions policy). Tesseract.js
is externalized so its workers and WASM load from disk at runtime.

A practical deployment path is a static/Vercel-style Next.js host. If you want a
Workers/Sites-style target, only dedicated public build output should be uploaded,
and the backend must run inside a Workers-compatible runtime. Node/Bun servers,
containers and arbitrary runtime features are out of scope for that path.

---

## Verification status

As of the current build:

- TypeScript strict check passes.
- ESLint passes.
- The full test suite passes.
- The production build completes cleanly.
- End-to-end smoke tests against the running dev server pass for health, analysis,
  URL checking, persisted-data refusal, security headers and rate limiting.

---

## License

This project is provided as-is for educational and awareness use. It is not a
consumer product and is not affiliated with any bank, telecom operator, police
agency or government body.
