# Agent Guidelines & Operational Directives

> **Workspace Directives for AI Agents Working on the Subscription Management System**
>
> This document governs all automated and assisted coding, refactoring, documentation, and operational work within this repository. All agents (including Antigravity, Claude Code, Cursor, and subagents) MUST adhere to these directives without exception.

---

## 0. Prime Directives (Non-Negotiable)

1. **Always Use and Follow AGENTS.md**:
   - Before taking any action, planning, coding, refactoring, or generating documentation, agents MUST consult and strictly adhere to this file.
   - Every architectural, testing, and UI rule in this document is authoritative and supersedes generic defaults.

2. **Absolute Zero Emojis Policy (Everywhere)**:
   - **Never** use emojis in any context within this repository or during user interaction.
   - Prohibited in:
     - User interface (labels, badges, toasts, headers, tables, buttons).
     - Documentation (README, markdown files, guides, tasklogs).
     - Git commit messages and PR descriptions.
     - Code comments, docstrings, and log messages.
     - Agent chat responses and explanations.
   - Use plain text, standard markdown indicators like `[x]` or `YES`, or standard Lucide SVG icons in frontend code. Zero exceptions.

---

## 1. Core Engineering Philosophy: The Ponytail Rule (YAGNI & Simplicity)

1. **Do Not Reinvent the Wheel**:
   - **Never** write custom code or bespoke abstractions from scratch when a battle-tested, high-quality library exists in the ecosystem.
   - Core libraries chosen for this stack:
     - Authentication & Sessions: `Better Auth`
     - Database ORM & Migrations: `Drizzle ORM` (`drizzle-kit`)
     - Background Queues & Schedulers: `BullMQ`
     - Boundary Validation: `Zod`
     - API Routing & Contracts: `Hono` + `@hono/zod-openapi`
     - Transactional Email: `Resend`
     - PDF Document Generation: `PDFKit`
     - Observability & Tracing: `OpenTelemetry`
   - If an unlisted capability is needed, research existing open-source libraries before proposing custom implementations.
2. **Standard Library & Native Platform First**:
   - Prefer ECMAScript/Node standard library and SQL constraints over custom helper functions.
   - Prefer HTML/browser native capabilities over heavyweight UI widgets (e.g. native date pickers, CSS flex/grid over JS layout engines).
3. **Shortest Working Diff Wins**:
   - No speculative abstractions (no interfaces with only one implementation, no factories for a single class, no unused generic helpers).
   - Flag deliberate trade-offs or simplifications using comments formatted as: `// ponytail: <description>`.

---

## 2. Mandatory Database Code Review Protocol

Financial, subscription, and billing data require absolute data integrity. On **every** change that touches database schemas, queries, or transactions:

1. **Precision & Money Handling**:
   - **Zero Floating-Point Calculations**: Never use JavaScript `Number` for money or tax arithmetic.
   - Use PostgreSQL `NUMERIC(14, 4)` or integer minor units, and decimal-safe libraries in application logic.
2. **Transaction Boundaries**:
   - Any multi-record state mutation (e.g., accepting a quotation, generating bulk invoices, recording payments, pausing a subscription) MUST be wrapped in a database transaction (`db.transaction(...)`).
3. **Constraints as the Final Safety Net**:
   - Foreign keys, unique constraints (e.g., `(subscription_id, billing_period_start)`), and check constraints must enforce business invariants at the database layer. Application-level checks alone are insufficient.
4. **Idempotency & Concurrency**:
   - Prevent race conditions using database unique constraints or row-level locking (`SELECT ... FOR UPDATE`) where appropriate.
   - Batch billing scans must never generate duplicate invoices even if re-triggered simultaneously.
5. **Drizzle Migration Discipline**:
   - All schema changes must be accompanied by version-controlled migration files generated via `drizzle-kit generate`. Never manually alter database tables without a migration.

---

## 3. CodeGraph Intelligence Protocol

This repository is indexed by **CodeGraph**. The index is located in `.codegraph/`.

1. **Reach for CodeGraph First**:
   - Before using `grep`, `find`, or sequentially reading files to understand symbol usage or call hierarchies, query CodeGraph:
     - **MCP Tool**: Call `codegraph_explore` with `projectPath: "/devdrive/github/projects/subscription-management"` and the symbol or query.
     - **Shell CLI**: Run `codegraph explore "<symbol or question>"` or `codegraph node "<symbol>"`.
2. **Keep the Index Synchronized**:
   - After adding, modifying, or renaming files or modules, run:
     ```bash
     codegraph sync .
     ```
   - Verify index status using `codegraph status .`.

---

## 4. Skill Autonomy & Customization

1. **Permission to Install Skills**:
   - Agents are explicitly authorized to install and configure skills in `.agents/skills/` or per-user configurations when complex or repetitive workflows require specialized tooling.
2. **Using Ponytail Skills**:
   - When reviewing code for over-engineering, use `ponytail-review` or `ponytail-audit`.
   - When logging deferred improvements, use `ponytail-debt`.

---

## 5. Docker & Drive Connectivity Protocol

All local development and deployment instances run within Docker containers.

1. **Host Drive Mappings**:
   - **Source Code**: Host `./apps` and `./packages` bind-mount into container `/app` for active hot-reloading.
   - **PostgreSQL Data**: Host `./data/postgres` binds to container `/var/lib/postgresql/data` for persistent data storage.
   - **Redis Queue & Cache Data**: Host `./data/redis` binds to container `/data` for BullMQ job persistence.
   - **Generated Media & Invoices**: Host `./data/media` binds to container `/app/media`.
2. **Container Isolation & Policy**:
   - Redis must run with `--appendonly yes --maxmemory-policy noeviction` so BullMQ jobs are never dropped during cache pressure.
   - PostgreSQL runs on port `5432`, API runs on `3001`, Web runs on `3000`, Mailpit runs on `8025` (web UI) and `1025` (SMTP).

---

---

## 6. UI Deslopification Standard & Design Language

> **Purpose:** Keep the product interface deliberate, restrained, useful, and coherent. Remove visual noise, decorative UI, redundant information, fake system activity, and unnecessary interaction patterns.
>
> Apply this standard whenever creating, modifying, reviewing, or polishing UI in this project. It supplements the existing design language; it does not replace the color palette, component system, or product requirements.

### 6.1 Core Principle
**Every visible element must earn its place.**
An element is justified when it helps the user understand information, make a decision, complete an action, understand a real system state, or navigate the application. If it does none of these, remove it.

Prefer:
- Clear hierarchy over decoration.
- Useful information over visual activity.
- Consistency over novelty.
- Calm, stable interfaces over animated interfaces.
- Specific labels over vague status language.
- One clear representation over repeated representations.

Do not add elements simply to make a page look more populated, modern, technical, or impressive.

### 6.2 Strictly Prohibited Visual Patterns
1. **No Flashing, Pulsing, or Attention-Seeking Decoration**:
   - Never use decorative pulsing dots, flashing indicators, breathing or glowing circles, animated rings, blinking badges, bouncing icons, shimmering/moving borders, or fake live indicators.
   - Do not use CSS animations such as `pulse`, `ping`, `blink`, or infinite glow effects for ordinary UI decoration.
   - *Exception:* Motion or an indicator may be used only when it communicates a real, user-relevant state that cannot be communicated as clearly with a static treatment. Prefer a static label or icon, and respect `prefers-reduced-motion`.
2. **No Fake System-Status Language**:
   - Do not invent operational statuses or technical labels to make a business application look like a control room (e.g., "Engine online", "System operational", "All systems nominal", "Core active", "Network stable", "Sync engine running", "Live monitoring enabled", "Lock: Advisory Safe", "Live stream").
   - Only display infrastructure or operational health information when the application actually measures that state, the information is relevant to the current user, and the user can make a decision or take action based on it. A subscription-management dashboard is a business tool, not a spacecraft dashboard.
3. **No Decorative Counters or Meaningless Metrics**:
   - Do not invent random percentages, fake uptime, fake activity counts, arbitrary performance scores, decorative progress bars, unexplained numerical indicators, or metrics that do not map to a real business concept. Every metric must have a clear definition, a real data source, and a reason to be displayed.

### 6.3 Remove Redundant Information
- Do not communicate the same information multiple times in the same visual region (e.g. repeating names across headers and cards, showing "Active" badge next to a status column, repeating timestamps everywhere).
- Use the shortest label that remains unambiguous.

### 6.4 Avoid Generic Dashboard Filler
- Avoid "Welcome back" banners, decorative hero sections, generic motivational messages, empty activity feeds with placeholder events, and unhelpful "quick insights".
- Useful information includes: active subscriptions, MRR / period revenue, outstanding invoice balances, overdue invoices, upcoming renewals, recent payments, and billing failures requiring attention. Never fabricate data to fill a layout.

### 6.5 Use Status Indicators Sparingly and Accurately
- Status badges are for meaningful state, not decoration (Draft, Pending, Active, Paused, Closed, Overdue, Paid, Failed).
- Use the same status vocabulary throughout the application.
- Use color only when it adds meaning. Do not give every badge a different bright color or place decorative dots inside every badge.
- Use neutral styling by default. Reserve stronger emphasis for genuinely important states such as overdue invoices or failed payments.

### 6.6 Buttons and Actions
- Buttons must represent real actions.
- Do not add buttons solely for visual balance or provide multiple buttons for the same action.
- Action hierarchy: 1 primary action per context; secondary actions as understated buttons; destructive actions distinct but not alarmist; contextual actions in menus.
- Never use pulsing, glowing, flashing, or bouncing treatments.

### 6.7 Icons and Decorative Shapes
- Use icons from `lucide-react` to improve recognition or reduce label length, not as decoration.
- Never use emojis anywhere in the UI or codebase (no rocket, clock, bell, cross, moneybag, checkmark, or other emoji characters).
- Avoid arbitrary circles, dots, rings, sparkles, crosses, and geometric ornaments.

### 6.8 Cards, Panels, and Borders
- Do not put every element inside a card. Use layout, spacing, alignment, and subtle separators before adding containers.
- Avoid nested cards, heavy borders, and large drop shadows.
- Use tables for structured records, not grids of cards pretending to be tables.

### 6.9 Tables and Information Density
- Keep column labels concise. Right-align numerical and monetary columns.
- Use consistent date and currency formatting. Use subtle separators rather than heavy grid lines.

### 6.10 Charts and Data Visualization
- A chart must answer a real question with defined data and time range. Prefer a clear table or single metric when it communicates information better.

### 6.11 Motion and Interaction
- Motion should clarify cause and effect, not attract attention. Avoid infinite animations or spring/bounce effects. Respect reduced-motion preferences.

### 6.12 Empty, Loading, and Error States
- Be honest and useful. Explain what is missing or failed in plain language with a recovery action. Never expose stack traces to ordinary users.

### 6.13 Content and Microcopy
- Write interface text as a product tool, not marketing copy. Avoid hype ("Your financial command center", "Powering your journey").

### 6.14 Accessibility is Not Optional
- Maintain readable contrast (WCAG AAA), keyboard navigation, visible focus states, and semantic controls.

### 6.15 Shadcn/UI Architecture & Color Palette
- Use standard shadcn component primitives (Button, Card, Badge, Input, Table, Tabs, Dialog, Dropdown, Separator).
- **Authoritative Palette: Orange, White, Black**:
  - Primary Accent: Precision Orange (`#FF6B00`).
  - Light Theme: Crisp White / Neutral 50 (`#FFFFFF`, `#F8F8F9`), Dark text (`#09090B`), Subtle borders (`#E5E5E5`).
  - Dark Theme: Deep Pitch Black (`#09090B`, `#121214`), White text (`#FAFAFA`), Dark borders (`#27272A`).
  - Include a sleek light/dark theme switcher.

### 6.16 Required Review Before Calling a UI Finished
- **Necessity**: Does every visible element serve a user task or communicate useful information?
- **Honesty**: Are all metrics and statuses backed by real data?
- **Restraint**: Are there flashing, pulsing, glowing, or bouncing elements?
- **Consistency**: Do spacing, typography, controls, tables, and statuses follow shared patterns?
- **Usability**: Is the primary action obvious? Can users scan the page quickly?

### 6.17 Agent Instruction
When asked to create or redesign UI, apply this standard proactively. Do not wait for the user to point out visual clutter. Prefer removing unnecessary elements over adding new ones. The goal is not to make the UI empty. The goal is to make every element intentional.

---

## 7. Comprehensive Testing Mandate

1. **Test Coverage Across All Layers**:
   - Every API endpoint, database schema constraint, billing calculation, and state mutation must have automated tests.
   - Layers to cover:
     - **Domain & Pricing**: Zero floating-point arithmetic, tier evaluations, discount logic, date intervals.
     - **Database Constraints**: Unique constraints (e.g. `(subscription_id, billing_period_start)`), cascade deletions, check constraints.
     - **Billing Engine & Scheduler**: Idempotency, Postgres advisory locks, concurrent overlap prevention, invoice generation.
     - **API HTTP Contracts**: Status codes, input validation with Zod, role enforcement (`admin`, `staff`, `customer`).

---

## 8. Every-Edit Checklist

Before completing any task, verify:
- [ ] **Always Consult AGENTS.md**: Ensured all directives in this document were followed throughout the task.
- [ ] **Zero Emojis Policy**: Verified zero emojis across UI, code, markdown documentation, commit messages, comments, and agent outputs.
- [ ] **UI Deslopify**: Zero gradients, zero emojis, proper Lucide icons, sleek light/dark theme switcher, orange/white/black palette, shadcn primitives.
- [ ] **Ponytail Check**: Did I reinvent something standard library or a known npm package already solves?
- [ ] **Database Integrity**: Did I review transactional boundaries, decimal precision, and constraints?
- [ ] **Comprehensive Testing**: Are unit and integration tests passing across API, DB, and domain?
- [ ] **CodeGraph Sync**: Did I run `codegraph sync .` after modifying source files?
- [ ] **Documentation Parity**: If an API route, background job, or schema was added/modified, did I update `docs/`?
- [ ] **Lint & Type Safety**: Does TypeScript compile cleanly without unsafe `any` casts?
- [ ] **Comment & Docstring Integrity**: Preserved existing comments and added clear JSDoc where public contracts changed.

