# AI Coding Agent Instructions

## Section 1: Project Overview
- AarogyaVani is a voice-first health navigation tool for ASHA workers and rural patients in India
- NOT a diagnostic tool — it categorizes risk levels (RED/YELLOW/GREEN) and guides next steps
- Uses Sarvam AI for voice/translation/OCR and Gemini Flash for AI reasoning
- Deployed on Netlify (frontend + serverless functions)

## Section 2: Setup Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run lint         # Run linter
npx tsc --noEmit     # Type check
```
Environment: Copy `.env.example` to `.env` and add `SARVAM_API_KEY` + `GEMINI_API_KEY`

## Section 3: Directory Layout
```text
main/
├── AGENTS.md
├── README.md
├── netlify.toml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── netlify/functions/     # Serverless API endpoints
│   ├── voice.ts           # Speech-to-text + translation
│   ├── scan.ts            # Document OCR
│   └── check.ts           # Danger rules + AI risk assessment + TTS
└── src/
    ├── App.tsx             # Main wizard flow
    ├── main.tsx            # Entry point
    ├── index.css           # Tailwind + custom styles
    ├── lib/                # Shared logic
    │   ├── types.ts        # Zod schemas + TypeScript types
    │   ├── rules.ts        # Danger sign detection (offline-capable)
    │   ├── constants.ts    # Body regions, risk colors, step labels
    │   └── api.ts          # API client
    ├── hooks/              # React hooks
    │   ├── useAudioRecorder.ts
    │   └── useEmergencyCheck.ts
    └── components/         # UI components
        ├── VoiceButton.tsx
        ├── BodyMap.tsx
        ├── DocumentScanner.tsx
        ├── ResultCard.tsx
        ├── VoicePlayer.tsx
        └── StepIndicator.tsx
```

## Section 4: Coding Conventions
- TypeScript strict mode, no `any` types
- Functional React components with hooks
- Zod for runtime validation of API payloads
- Tailwind CSS for styling (no CSS modules)
- camelCase for variables/functions, PascalCase for components/types
- Hindi text included inline with English (bilingual UI)

## Section 5: Clinical Safety Boundaries
- **ALWAYS DO:** Run danger sign rules before any LLM call. Show disclaimer on all results. Include explainability (why this risk level).
- **ASK FIRST:** Before modifying danger sign keywords in `rules.ts`. Before changing the Gemini prompt in `check.ts`. Before adding new risk categories.
- **NEVER DO:** Generate text that sounds like a medical diagnosis. Use words like 'diagnosed', 'prescription', 'you have [disease]'. Remove the clinical safety disclaimer. Skip the deterministic danger-sign check.

## Section 6: API Endpoints
- `POST /api/voice` — Send audio FormData, get Hindi + English transcript
- `POST /api/scan` — Send image FormData, get extracted text (async OCR job)
- `POST /api/check` — Send symptoms JSON, get risk level + guidance + Hindi audio

## Section 7: Testing & Verification
```bash
npx tsc --noEmit     # Must pass with no errors
npm run build        # Must produce dist/ folder
npm run lint         # Must pass
```
Manual: Test voice recording in Chrome, test all 3 risk levels, verify Hindi TTS playback.
