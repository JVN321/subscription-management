# Frontend: TanStack Start

> **Status: Confirmed Architecture**
>
> Architecture, routing, state management, and user experience standards for `apps/web`.

---

## 1. Role & Technology Overview

`apps/web` is built using **TanStack Start**, a modern full-stack React framework providing type-safe routing (TanStack Router), server-side rendering (SSR), data prefetching, and robust hydration.

Key Advantages:
- **Zero Drift Types**: Seamlessly infers URL parameters, search params, and loader outputs.
- **Server Functions**: Executes server-side data fetching without exposing internal secrets to the browser.
- **Fast First Paint**: Server-renders critical dashboard and catalog tables to meet the sub-2-second performance target.

---

## 2. Directory Structure (`apps/web`)

```text
apps/web/
├── app/
│   ├── routes/
│   │   ├── __root.tsx              # Root layout, HTML skeleton, global header
│   │   ├── index.tsx               # Public landing / redirection
│   │   ├── (auth)/                 # Login, password reset, account activation
│   │   │   ├── login.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── admin/                  # Admin console (products, plans, taxes, staff)
│   │   ├── staff/                  # Staff operations (quotes, subscriptions, billing, payments)
│   │   └── portal/                 # Customer self-service portal
│   ├── components/                 # Reusable UI components (tables, badges, dialogs)
│   ├── lib/
│   │   ├── auth-client.ts          # Better Auth React client integration
│   │   └── api-client.ts           # Generated typed fetch client from OpenAPI
│   └── styles/
│       └── globals.css             # Vanilla CSS design tokens & responsive utilities
├── package.json
└── tsconfig.json
```

---

## 3. Data Fetching & Caching Strategy

- **TanStack Query Integration**: Data loaders in routes query `apps/api` via the typed OpenAPI client. Responses are cached on the client with sensible stale times (e.g., 30s for catalog data, 5s for dashboard metrics).
- **Optimistic UI**: Form actions for confirming invoices or recording payments apply optimistic updates to the UI, reverting gracefully if the API responds with an error.
- **Accessibility & Native Controls**: Use native HTML5 controls (`<input type="date">`, `<select>`, `<dialog>`) in accordance with the Ponytail rule, avoiding heavy external component libraries.
