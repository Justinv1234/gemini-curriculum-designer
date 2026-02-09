# Curriculum Designer Web App — The Full Story

*A plain-language guide to how this thing works, why it's built the way it is, and what you'd want to know if you were hacking on it tomorrow.*

---

## What Is This Thing?

You already had a **CLI skill** — a big Markdown file (`SKILL.md`) that tells Claude Code or Gemini CLI how to walk a teacher through designing a curriculum step-by-step. It works great, but it requires the user to be comfortable in a terminal. Most educators are not.

The web app (`curriculum-designer-web/`) wraps that same curriculum design workflow in a friendly, wizard-style UI that anyone can use from a browser. No terminal. No installation. Just open the URL, answer some questions, watch AI write your curriculum, and download everything as Markdown or PDF.

---

## Technical Architecture

### The Big Picture

```
┌─────────────────────────────────────────────────┐
│                    Browser                       │
│                                                  │
│  Next.js Pages ←→ Zustand Store ←→ localStorage │
│       ↓ (fetch)                                  │
│  ┌──────────────────────────────┐                │
│  │     Next.js API Routes       │  (server-side) │
│  │  Parse request → Build prompt │               │
│  │  → Call Claude API → Stream   │               │
│  │    response back via SSE      │               │
│  └──────────────┬───────────────┘                │
│                 ↓                                │
│         Anthropic Claude API                     │
└─────────────────────────────────────────────────┘
```

### Why This Shape?

Think of it like a restaurant:

- **The Browser** is the dining room. The user sees a nice UI, picks from a menu (topic, audience, format), and places orders.
- **The API Routes** are the kitchen. They take the order, prepare the right "recipe" (prompt), send it to the chef (Claude), and stream the food back plate-by-plate (token-by-token) so the user doesn't stare at a blank screen.
- **Claude API** is the chef. Does the actual creative work.
- **Zustand + localStorage** is the doggy bag. If you close the browser and come back tomorrow, your half-finished curriculum is still there.

There's **no database**. This is an MVP decision — everything lives in the browser's localStorage. It's simpler, cheaper, and good enough for single-user sessions. The tradeoff: if you clear your browser data, your progress is gone.

---

## Codebase Structure

### The Tree (What Lives Where)

```
curriculum-designer-web/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                  # Landing page ("Start Designing" hero)
│   │   ├── layout.tsx                # Root HTML shell
│   │   ├── globals.css               # Tailwind + shadcn theme variables
│   │   │
│   │   ├── design/                   # The wizard flow
│   │   │   ├── layout.tsx            # Wizard shell (sidebar + content area)
│   │   │   ├── phase-1/page.tsx      # Course Vision & Research
│   │   │   ├── phase-2/page.tsx      # Module Design (iterative)
│   │   │   ├── phase-3/page.tsx      # Assessment Design
│   │   │   ├── phase-4/page.tsx      # Delivery Templates
│   │   │   └── review/page.tsx       # Final Review & Export
│   │   │   └── enhance/              # Enhancement flow pages
│   │   │       ├── step-1/page.tsx   # Upload + Analyze
│   │   │       ├── step-2/page.tsx   # What's New research
│   │   │       ├── step-3/page.tsx   # Enhancement proposals
│   │   │       ├── step-4/page.tsx   # Apply changes
│   │   │       └── review/page.tsx   # Enhance review & export
│   │   │
│   │   └── api/
│   │       ├── enhance/              # Enhancement API routes
│   │       │   ├── extract-text/route.ts # PDF/DOCX text extraction
│   │       │   ├── analyze/route.ts     # Analyze uploaded materials (SSE)
│   │       │   ├── whats-new/route.ts   # Research updates (SSE)
│   │       │   ├── propose/route.ts     # Generate proposals (JSON)
│   │       │   └── update/route.ts      # Generate per-proposal changes (SSE)
│   │       └── curriculum/           # Create-mode API routes
│   │       ├── research/route.ts     # Phase 1: topic landscape
│   │       ├── module/
│   │       │   ├── propose/route.ts  # Phase 2 legacy: module proposal
│   │       │   ├── prerequisites/route.ts # Phase 2 interview step 1 (JSON)
│   │       │   ├── concepts/route.ts     # Phase 2 interview step 2 (JSON)
│   │       │   ├── lessons/route.ts      # Phase 2 interview step 3 (JSON)
│   │       │   └── generate/route.ts     # Phase 2 final: full module (dual-mode SSE)
│   │       ├── assessment/route.ts   # Phase 3: assessments + rubrics
│   │       └── delivery/route.ts     # Phase 4: delivery templates
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives (Button, Card, Tabs, etc.)
│   │   ├── wizard/
│   │   │   ├── WizardShell.tsx       # Sidebar + content layout wrapper
│   │   │   └── PhaseIndicator.tsx    # Phase nav with checkmarks
│   │   ├── phase-1/
│   │   │   ├── CourseInfoForm.tsx     # Radio card form for course parameters
│   │   │   ├── TopicLandscapeView.tsx # Accordion cards for structured landscape
│   │   │   └── ModuleListEditor.tsx   # Editable card list for suggested modules
│   │   ├── phase-2/
│   │   │   ├── ModuleInterview.tsx    # Orchestrator: 4-step interview flow
│   │   │   ├── PrerequisitesStep.tsx  # Step 1: prereq cards with status toggles
│   │   │   ├── ConceptsStep.tsx       # Step 2: concept cards with priority toggles
│   │   │   └── LessonsStep.tsx        # Step 3: lesson/activity cards with toggles
│   │   ├── enhance/                   # Enhancement flow components
│   │   │   ├── FileUpload.tsx         # Drop zone with 200KB limit, PDF/DOCX extraction
│   │   │   ├── AnalysisReportView.tsx # Summary cards, inventory table, gap badges
│   │   │   ├── EnhancementSelector.tsx # Multi-select proposal cards with impact badges
│   │   │   ├── ChangeReviewCard.tsx   # Before/after display with approve/reject
│   │   │   └── ChangelogView.tsx      # Categorized changelog entries
│   │   └── shared/
│   │       ├── MarkdownRenderer.tsx   # react-markdown with GFM + syntax highlighting
│   │       ├── StreamingText.tsx      # Shows content + blinking cursor while streaming
│   │       ├── EditableTab.tsx        # Shared edit/view toggle for review tabs
│   │       └── ExportButtons.tsx      # Download Markdown .zip / PDF .zip
│   │
│   ├── lib/
│   │   ├── claude/                   # Prompt engineering layer
│   │   │   ├── client.ts            # Anthropic SDK singleton
│   │   │   ├── prompts.ts           # System prompt + ENHANCE_SYSTEM_PROMPT + model config
│   │   │   ├── enhance.ts          # Enhancement flow prompt builders (4 builders)
│   │   │   ├── research.ts          # Phase 1 prompt builder
│   │   │   ├── module.ts            # Phase 2 prompt builders (legacy + 4 interview builders)
│   │   │   ├── assessment.ts        # Phase 3 prompt builder
│   │   │   └── delivery.ts          # Phase 4 prompt builder
│   │   ├── export/
│   │   │   ├── markdown.ts          # Bundle .md files into .zip (JSZip)
│   │   │   └── pdf.ts              # Markdown → HTML → PDF (html2pdf.js)
│   │   ├── parsers.ts               # JSON block extraction from AI responses
│   │   ├── hooks/
│   │   │   └── useStreaming.ts      # Reusable SSE streaming hook
│   │   ├── store/
│   │   │   └── curriculum-store.ts  # Zustand store (all wizard state)
│   │   └── types/
│   │       └── curriculum.ts        # TypeScript interfaces
│   │
│   ├── content/                     # Reference docs (extracted from SKILL.md)
│   │   ├── system-prompt.md
│   │   └── pedagogy.md
│   │
│   └── middleware.ts                # Rate limiting (30 req/min per IP)
│
├── amplify.yml                      # AWS Amplify build config
├── .env.local                       # ANTHROPIC_API_KEY (never committed)
└── .env.example                     # Template for .env.local
```

### How They Connect

Here's the data flow for a typical interaction:

1. **User fills out form** (e.g., `CourseInfoForm.tsx`) → form data goes to Zustand store
2. **User clicks "Generate"** → page calls `useStreaming` hook → hook `fetch`es the API route
3. **API route** (`route.ts`) reads the request body → calls a prompt builder (`lib/claude/research.ts`) to construct the Claude prompt → calls `client.messages.stream()` → pipes tokens back as SSE
4. **`useStreaming` hook** reads the SSE stream token-by-token → updates `content` state → React re-renders `StreamingText` component
5. **When stream ends** → final content saved to Zustand store → persisted to localStorage
6. **On export** → `ExportButtons` reads all content from store → `markdown.ts` bundles into .zip or `pdf.ts` converts and bundles

---

## Technology Choices (and Why)

### Next.js (App Router)

**What it is:** React framework that gives you both frontend pages and backend API routes in one project.

**Why we picked it:** We need server-side API routes to keep the Anthropic API key secret. With Next.js, the API routes run on the server — the browser never sees the key. Without this, we'd need a separate backend. Next.js gives us a monorepo-like experience: one `npm run dev` spins up everything.

**The alternative we didn't pick:** A separate Express/FastAPI backend + React SPA frontend. More infrastructure, more deployment complexity, and we're building an MVP.

### shadcn/ui + Tailwind CSS

**What it is:** shadcn/ui gives you copy-paste React components (Button, Card, Tabs, etc.) built on top of Radix UI primitives. Tailwind CSS is utility-first CSS.

**Why:** Speed. Instead of writing a design system from scratch or wrestling with a heavyweight component library, shadcn gives us polished, accessible components that we own (they're in our codebase, not hidden in node_modules). Tailwind means we write `className="text-sm font-bold"` instead of creating CSS files. For an MVP, this combo is unbeatable.

**Gotcha we hit:** Tailwind v4 changed how plugins work. Instead of a `tailwind.config.js` plugins array, you now use `@plugin "@tailwindcss/typography"` directly in CSS. The old way silently doesn't work.

### Zustand (State Management)

**What it is:** A tiny state management library (like Redux, but without the boilerplate avalanche).

**Why:** Our wizard has state that needs to survive across 5 different pages AND browser refreshes. Zustand's `persist` middleware writes to localStorage automatically. The whole store is ~50 lines of code. With Redux, it'd be 200+ lines across actions, reducers, selectors, and middleware config.

**How it works:** Imagine a global notebook that every page can read from and write to. When Phase 1 saves the course info, Phase 2 can read it. When you close the browser, the notebook is saved under your bed (localStorage). When you come back, it's right where you left it.

### Server-Sent Events (SSE) for Streaming

**What it is:** A way for the server to push data to the browser in real-time, one chunk at a time.

**Why not just wait for the full response?** Claude can take 30-60 seconds to generate a full module. Nobody wants to stare at a loading spinner for a minute. With SSE, tokens appear as Claude thinks — it feels alive and interactive.

**How it works under the hood:**
1. The API route creates a `ReadableStream`
2. For each token Claude generates, we encode it as `data: {"text": "..."}\n\n` and push it into the stream
3. The browser reads the stream chunk by chunk via `response.body.getReader()`
4. Our `useStreaming` hook parses each SSE line, extracts the text, and appends it to state
5. React re-renders `StreamingText`, which shows the growing markdown

**Why not WebSockets?** Overkill. SSE is one-directional (server → client), which is exactly what we need. It works over regular HTTP, no special server setup. WebSockets would add complexity for zero benefit here.

### JSZip + html2pdf.js (Export)

**What it is:** JSZip creates .zip files in the browser. html2pdf.js converts HTML to PDF in the browser.

**Why client-side?** No server resources needed. The user's browser does all the work. This means export works even if the server is down (as long as they have cached content). It also avoids sending potentially large documents back through our servers.

**The PDF pipeline is clever but janky:** We take Markdown → convert to basic HTML with a regex-based parser → wrap in styled HTML → feed to html2pdf.js → get a blob → put it in the zip. The regex Markdown parser is NOT a full parser — it handles headers, bold, code blocks, tables, and lists, but complex nested Markdown might look weird. For the MVP, it's good enough. If quality becomes an issue, we'd swap in a proper server-side Markdown → PDF pipeline.

---

## Decision Reasoning

### "No Database" Decision

**The choice:** Store everything in the browser's localStorage via Zustand's `persist` middleware.

**Why:** For an MVP targeting individual educators, there's no need for user accounts, sharing, or collaboration. A database would mean:
- Setting up and paying for a database service
- Building authentication
- Handling user data privacy/GDPR
- More API routes for CRUD operations

None of that helps an educator who just wants to design a curriculum and download it. If we later need multi-user support, we'd add a database then — the Zustand store structure maps cleanly to a database schema.

### "One System Prompt for All Phases" Decision

**The choice:** All 5 API routes share the same base system prompt (`SYSTEM_PROMPT` in `prompts.ts`), with phase-specific context coming from the user prompt.

**Why:** Claude doesn't maintain conversation state between API calls. Each call is independent. Rather than trying to simulate a conversation, we pass all relevant context explicitly in each request. Phase 2's module generation includes the course info from Phase 1 and the approved proposal — everything Claude needs in one shot.

**The alternative:** Using multi-turn conversations with conversation IDs. This would require server-side session storage and adds complexity. The "stateless with context" approach is simpler and more reliable.

### "Manual SSE Instead of Vercel AI SDK" Decision

**The plan called for Vercel AI SDK (`ai` package),** but we ended up using manual SSE streaming with `ReadableStream` + `TextEncoder`.

**Why the switch:** The Vercel AI SDK's `useCompletion` hook is designed for their specific streaming format. Our API routes use the Anthropic SDK directly, which gives us more control over the streaming format and error handling. The manual approach is ~30 lines of code per route (almost identical across all 5 routes) and our `useStreaming` hook handles the client side cleanly.

### Rate Limiting Strategy

**30 requests per minute per IP, in-memory.**

**Why in-memory?** It resets when the server restarts, but for an MVP, that's fine. The alternative (Redis or a database) adds infrastructure. If someone is genuinely abusing the API, we'd notice from the Claude API billing before the rate limiter matters.

**Why 30/min?** Each curriculum phase makes 1-3 API calls. A user going through the entire wizard makes maybe 10-15 calls total. 30/min gives generous headroom without leaving the door wide open.

---

## The Wizard Flow (How the UI Actually Works)

### Phase 1: Course Vision

The user lands on a form with four questions (mirroring the CLI skill's `AskUserQuestion` calls):

1. **Topic** — free text ("Machine Learning", "Web Development", etc.)
2. **Audience** — radio cards (Beginners / Intermediate / Advanced / Mixed)
3. **Format** — radio cards (Semester / Bootcamp / Workshop / Self-Paced)
4. **Philosophy** — radio cards (Project-Based / Theory-First / Problem-Based / Hands-On)

When they click "Research This Topic," we send these 4 values to `/api/curriculum/research`. The prompt builder (`research.ts`) constructs a detailed prompt asking Claude for a **Topic Landscape** (trends, tools, resources) and a **Suggested Module Breakdown** (5-8 modules).

The response streams in real-time (user sees markdown appearing). When streaming completes, we do something clever:

1. **Parse structured JSON blocks** — the prompt now asks Claude to append tagged JSON blocks (`json-landscape` and `json-modules`) after the readable markdown
2. **Swap to structured view** — if JSON parsing succeeds, the topic landscape swaps from a wall of markdown to **collapsible accordion cards** (Trends, Tools, Resources, Industry Context), and the module list becomes **editable card list** with inline editing, reorder arrows, and add/remove buttons
3. **Graceful degradation** — if JSON parsing fails (it's AI after all), we fall back to the raw markdown view as before

**The module card list** lets users click to edit names/descriptions inline, drag modules up/down with arrow buttons, and add or remove modules. This replaces the old brittle regex-parsing textarea.

**Approving** reads from the structured module array (or falls back to regex parsing) and creates `CurriculumModule` objects in the store.

### Phase 2: Module Design (The Interview)

This is the most complex phase. It used to be a simple 2-step "dump proposal text → dump content" flow. Now it's a **4-step guided interview** that mirrors the SKILL.md pattern:

**Step 1 — Prerequisites:** AI proposes 3-5 prerequisites. Each appears as a card with a 3-way toggle (Include / Quick Recap / Skip). The user can add or remove prereqs, then clicks "Confirm Prerequisites."

**Step 2 — Core Concepts:** AI proposes 4-6 concepts based on the confirmed prerequisites. Each card has a priority toggle (Emphasize / Normal / Optional). User can add or remove, then "Confirm Concepts."

**Step 3 — Lessons & Activities:** AI proposes lessons and activities based on the prereqs + concepts. Lesson cards have enable/disable toggles, teaching approach badges, and reorder arrows. Activity cards similar. Click "Approve Plan."

**Step 4 — Generate:** AI generates the complete module using all confirmed choices. This step uses SSE streaming (same as before) — the long-form content benefits from streaming.

**Key design decisions:**
- Steps 1-3 use **regular JSON API responses** (not SSE streaming) because they return small structured data that needs to be interactive, not a wall of text
- Step 4 uses **SSE streaming** for the long-form content generation
- The generate route is **dual-mode**: it accepts either the old `proposal` string (for backward compat with in-progress sessions) or the new structured interview data
- A **progress indicator** (4 dots/labels) at the top shows where you are in the interview
- All interview state is saved to the Zustand store after each step, so closing the browser mid-interview preserves your progress

The module list still appears as clickable pills with status badges, but now there are more granular statuses (interviewing-prereqs → prereqs-confirmed → interviewing-concepts → etc.).

### Phase 3: Assessments

Multi-select cards for 6 assessment types (Quizzes, Labs, Projects, Written, Peer Reviews, Portfolio). Click to toggle selection, then "Generate Assessments." The prompt includes all completed modules so the assessments align with the actual curriculum content.

### Phase 4: Delivery Templates

Same pattern as Phase 3 but for delivery formats (Slides, Jupyter, LMS, Video Scripts, GitHub Repo).

### Phase 5: Review & Export

Tabbed view showing all 4 output documents:
- **Curriculum** — all modules combined
- **Assessments** — the assessment content
- **Delivery** — the delivery templates
- **Resources** — the topic landscape from Phase 1

Each tab has an "Edit" button that swaps the Markdown preview for a raw textarea. The export buttons create .zip files with all documents in either Markdown or PDF format.

### The Enhancement Flow (Mode B)

The landing page now presents **two cards** — "Create New Curriculum" and "Enhance Existing Curriculum." Each sets the `mode` in the Zustand store and navigates to the appropriate flow. The enhancement flow mirrors the create flow's wizard structure but with different steps:

**Step 1 — Analyze Materials:** The user uploads curriculum files (.md, .txt, .pdf, .docx) via a drop zone. Files have a 200KB per-file limit. Text files are read client-side via `FileReader`; PDFs and DOCX files are sent to a server-side extraction API route using `pdf-parse` (v2, class-based API) and `mammoth`. Once uploaded, clicking "Analyze" sends all file contents to the `/api/enhance/analyze` route — this is the **only** step that sends raw file contents. The response streams in (SSE) and includes a `json-analysis` tagged block with a structured `AnalysisReport` (course name, inventory, gaps, strengths). After streaming, the structured report renders as summary cards, an inventory table with status badges, and color-coded gaps/strengths.

**Step 2 — What's New:** Takes only the structured `AnalysisReport` (not raw files!) and sends it to `/api/enhance/whats-new`. Claude researches recent developments relevant to the curriculum's gaps. Pure SSE-streamed markdown.

**Step 3 — Enhancement Proposals:** Sends the `AnalysisReport` + what's-new content to `/api/enhance/propose`. Returns a JSON array of `EnhancementProposal` objects with categories, impact ratings, and descriptions. The UI shows them as selectable cards — high-impact proposals are pre-selected. User toggles selections and clicks "Apply Selected."

**Step 4 — Apply Changes:** For each selected proposal, the UI sequentially calls `/api/enhance/update` (SSE streaming). Each response generates before/after content + a `json-change` block. Changes appear as `ChangeReviewCard` components with approve/reject buttons. Approved changes automatically add entries to the changelog.

**Enhance Review:** Four tabs — Analysis, What's New, Changes (approved only), Changelog. Same `EditableTab` component and `ExportButtons` as the create flow, but exports enhancement-specific files.

**Key architectural decisions:**
- **Payload efficiency:** Only the analyze step sends raw file contents. Steps 2-4 work from the structured `AnalysisReport`, keeping API payloads small (~1KB vs 50KB+).
- **Mode isolation:** `setMode()` clears the other mode's state to prevent stale cross-mode data.
- **localStorage safety:** `uploadedFiles` are excluded from Zustand persistence via `partialize` to avoid hitting the 5MB localStorage limit.
- **Chained migration:** Store version bumped from 1→2 with `if (version < 1) ... if (version < 2) ...` pattern so users migrating from v0 still get both migrations applied.

---

## Lessons Learned

### 1. Tailwind v4 Plugin Syntax Changed

**The bug:** After installing `@tailwindcss/typography`, the `prose` classes had no effect. No errors, just... nothing happened.

**The fix:** Tailwind v4 uses `@plugin "@tailwindcss/typography"` in your CSS file instead of the old `plugins: [require('@tailwindcss/typography')]` in `tailwind.config.js`. The old config-based approach silently does nothing.

**The lesson:** When a CSS framework updates its major version, always check the migration guide for plugin configuration changes. "It installed successfully" doesn't mean "it's configured correctly."

### 2. shadcn/ui Init Flags Changed

**The bug:** `npx shadcn@latest init -d --style default` threw `unknown option '--style'`.

**The fix:** shadcn v3+ dropped the `--style` flag. Just use `npx shadcn@latest init -d` and it picks defaults automatically.

**The lesson:** CLI tools change their flags between versions. If a command from a tutorial fails with "unknown option," check the tool's current `--help` output rather than searching for the old docs.

### 3. Next.js 16 "middleware" → "proxy" Warning

**What happened:** Build outputs a deprecation warning: `The "middleware" file convention is deprecated. Please use "proxy" instead.`

**What we did:** Nothing. It's a warning, not an error. The middleware still works perfectly. We'll migrate to the "proxy" convention when it's stable and well-documented.

**The lesson:** Not every deprecation warning needs immediate action. Especially in an MVP, shipping working code trumps chasing the latest convention. Just note it for future cleanup.

### 4. SSE Streaming Is Simpler Than You Think

**The fear:** "Streaming AI responses in real-time sounds hard."

**The reality:** It's ~30 lines on the server (create a ReadableStream, loop over Claude's stream events, encode each text delta as `data: {...}\n\n`) and ~30 lines on the client (fetch, get reader, decode chunks, parse SSE lines). The whole pattern is repeated almost identically across all 5 API routes.

**The pattern to remember:**
```
Server: ReadableStream + for await (event of stream) → encoder.encode(SSE format)
Client: fetch → response.body.getReader() → while loop → decode → parse "data:" lines
```

### 5. Zustand's Persist Middleware Just Works

**The expectation:** "State persistence will require careful serialization logic."

**The reality:** Add `persist` wrapper with a storage key name. That's it. Zustand handles serialization/deserialization automatically. Arrays, nested objects, null values — all survive the localStorage round-trip without any custom logic.

**The anti-pattern to avoid:** Don't store functions or class instances in persisted state. Only plain serializable data. We keep our store split into `CurriculumState` (data, persisted) and `CurriculumActions` (functions, not persisted).

### 6. The "Split AI Response" Problem (Now Solved!)

**The original situation:** Phase 1 asked Claude for TWO things in one call — a Topic Landscape AND a Module Breakdown. We split them by regex on "SECTION 2", which was fragile.

**The new approach:** We still get the readable markdown (for streaming), but now the prompt also asks Claude to append **tagged JSON blocks** at the end. These are fenced code blocks like ` ```json-landscape {...} ``` ` that we parse after streaming completes. The parser (`parsers.ts`) uses regex to find these blocks, extract the JSON, and return typed objects.

**Why both?** During streaming, the user sees markdown appearing in real-time (good UX). After streaming, we swap to the structured card view (better UX). If the JSON blocks are missing or malformed, we gracefully fall back to the markdown view. Best of both worlds.

**The lesson:** When you need both a streaming user experience AND structured data from AI, ask for both in the same prompt. Put the structured data in a machine-parseable format at the end so it doesn't interfere with the human-readable content.

### 6.5. JSON API Routes vs SSE for Interview Steps

**The decision:** Phase 2's interview steps 1-3 use regular JSON API responses (not SSE streaming).

**Why:** These responses return small structured data (3-5 prerequisites, 4-6 concepts, 3-5 lessons) that needs to be immediately interactive. Streaming makes no sense here — you can't toggle a prerequisite card that hasn't finished loading yet. Only Step 4 (full module generation) uses SSE because it produces long-form content that benefits from progressive rendering.

**The lesson:** Don't default to streaming just because it's cool. Match the response pattern to the UX need. Small structured data → JSON. Long-form content → SSE streaming.

### 6.75. Zustand Store Versioning and Migration

**The problem:** We added new fields to `CurriculumModule` (prerequisites, coreConcepts, lessonPlan) and new top-level state (topicLandscapeStructured, suggestedModulesStructured). Existing users have old-format data in localStorage.

**The solution:** Zustand's persist middleware supports `version` + `migrate`. We set `version: 1` and wrote a migration function that defaults the new fields to `null`. Old modules get `prerequisites: null`, `coreConcepts: null`, etc.

**The lesson:** Any time you add new fields to persisted state, bump the version and write a migration. Without this, Zustand would try to hydrate old data into the new types and either crash or silently lose the new fields' defaults.

### 7. Why Prompt Builders > Hardcoded Strings

Each phase has a dedicated prompt builder function (e.g., `buildResearchPrompt(courseInfo)`) rather than template strings embedded in API routes.

**Why this matters:**
- **Testability:** You can unit-test prompt builders without hitting the API
- **Readability:** The API route is clean (parse → build prompt → call Claude → stream)
- **Iteration:** Tweaking a prompt means editing one file, not hunting through route handlers
- **Context injection:** Builders can conditionally include previous modules, format labels, etc.

This is a pattern experienced engineers use for any AI-integrated app: **separate prompt construction from prompt execution.**

---

## Potential Pitfalls for Future Development

1. **localStorage has a ~5MB limit.** A curriculum with many long modules could hit it. If this happens, consider IndexedDB or compressing the stored data.

2. **The PDF export regex parser is basic.** Deeply nested lists, images, or complex table formatting will look wrong. If users complain about PDF quality, swap in a server-side Markdown-to-PDF library (like `md-to-pdf` or Puppeteer).

3. **Rate limiting is in-memory.** Serverless deployments (like AWS Lambda) spin up multiple instances, each with their own rate limit map. For real protection, use Redis or API Gateway throttling.

4. **No authentication.** Anyone with the URL can use the app and burn through your Claude API budget. For production, add at minimum a simple API key or password gate.

5. **Claude model is hardcoded.** If you want to test with a cheaper/faster model, change `MODEL` in `lib/claude/prompts.ts`. Consider making this an environment variable for easy switching between dev (Haiku) and production (Sonnet).

### 8. The oklch/lab PDF Export Crash

**The bug:** Clicking "Download PDF" crashed with `Attempting to parse an unsupported color function "lab"`. The error came from `html2canvas` (used by `html2pdf.js`), which can't parse modern CSS color functions like `oklch()` and `lab()`.

**The root cause:** shadcn/ui v3 + Tailwind v4 generates CSS custom properties using `oklch()` color space (e.g., `--primary: oklch(0.205 0 0)`). When html2pdf.js renders HTML to a canvas for PDF conversion, html2canvas tries to compute all CSS colors and chokes on anything that isn't hex/rgb/hsl.

**The fix:** In `pdf.ts`, the PDF export container is fully isolated from the page CSS:
1. Inline `style.cssText` on the container forces white background and standard colors
2. `wrapInHtmlDoc` uses ONLY hex colors (`#1a1a1a`, `#2563eb`, etc.) with `!important` to override any inherited oklch values
3. `html2canvas` gets an explicit `backgroundColor: "#ffffff"`

**The lesson:** If you're using modern CSS color functions (oklch, lab, lch, color()) in your UI framework, any tool that parses CSS client-side (html2canvas, dom-to-image, etc.) may not support them. Always use legacy color formats for generated HTML that leaves your app's rendering pipeline.

### 9. React useState Doesn't Reset on Prop Changes

**The bug:** Switching between modules in Phase 2 briefly showed the previous module's prerequisites/concepts before loading new ones.

**Why:** `useState` initializers only run once (on mount). Changing `moduleIndex` prop re-renders the component but doesn't re-initialize state. So `prereqs`, `concepts`, `lessons`, and `activities` kept the previous module's data until the new API response arrived.

**The fix:** Add a `useEffect` that watches `moduleIndex` and resets all local state from the store:
```js
useEffect(() => {
  const m = modules[moduleIndex];
  setPrereqs(m.prerequisites ?? []);
  setConcepts(m.coreConcepts ?? []);
  // ...
}, [moduleIndex]);
```

**The lesson:** When a component's "identity" should change based on a prop (like showing different data for different IDs), either use a `key` prop to force remount, or add a `useEffect` to reset state. The `key` approach is simpler but loses all internal state; the `useEffect` approach is more surgical.

### 10. pdf-parse v2 Has a Completely Different API

**The bug:** `const pdfParse = (await import("pdf-parse")).default` failed with "Property 'default' does not exist." The npm package `pdf-parse` bumped to v2, which is now a class-based API.

**The old API (v1):** `const pdfParse = require('pdf-parse'); const data = await pdfParse(buffer);`

**The new API (v2):** `const { PDFParse } = require('pdf-parse'); const parser = new PDFParse({ data: buffer }); const result = await parser.getText();`

Also, `load()` is marked as private in the type definitions even though it works — you don't need to call it because `getText()` calls it internally.

**The lesson:** Major version bumps of dependencies can completely change the API surface. Always check the actual exports (`Object.keys(require('pkg'))`) and type definitions rather than copying examples from tutorials that reference the old version.

### 11. Zustand partialize for Large Transient Data

**The problem:** Uploaded file contents could be 100-200KB each. Storing them in localStorage would quickly hit the 5MB limit.

**The solution:** Zustand's `persist` middleware supports a `partialize` option that lets you exclude specific fields from persistence. We used it to exclude `uploadedFiles`:

```js
partialize: (state) => {
  const { uploadedFiles: _, ...rest } = state;
  return rest;
}
```

**The tradeoff:** If the user refreshes the page, they need to re-upload their files. This is acceptable UX for an MVP — they still have their analysis results, proposals, and changes, which are the expensive parts to regenerate.

**The lesson:** Not all state deserves persistence. Large, easily-recreatable data (uploads, image previews, cached API responses) should be excluded from localStorage. Zustand's `partialize` makes this trivial.

### 12. Chained Migrations vs If/Else Migrations

**The bug that almost happened:** If we'd used `if (version === 0) ... else if (version === 1) ...` for migrations, a user upgrading from v0 would get the v0→v1 migration but MISS the v1→v2 migration. They'd land on v2 without the enhance fields.

**The fix:** Use chained `if (version < 1) ... if (version < 2) ...` (no `else`). This way, a v0 user gets both migrations applied sequentially.

**The lesson:** Database migrations use the same principle — each migration is applied independently and in order. Never use else/switch for version migrations unless you're certain users can only upgrade one version at a time.
