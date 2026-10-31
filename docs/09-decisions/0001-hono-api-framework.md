# ADR 0001: Use Hono as the HTTP API Framework

- **Status**: **Confirmed**
- **Date**: 2026-10-31
- **Deciders**: Architecture Team, Brightloop Engineering
- **Component**: `apps/api`

---

## 1. Context and Problem Statement
The backend HTTP API needs to serve REST endpoints, authenticate users via session cookies and bearer tokens, validate inbound payloads, provide interactive OpenAPI 3.1 documentation, and execute with sub-250ms P95 latency.

## 2. Decision Drivers
- Ultra-low runtime overhead and instant cold starts.
- Native TypeScript inference with zero build-time decorator magic.
- First-class `@hono/zod-openapi` integration to eliminate API documentation drift.
- Ponytail simplicity: standard Request/Response web standards.

## 3. Considered Options
1. **Hono**: Lightweight, typed web standard framework.
2. **Express**: Ubiquitous but dated; lacks native TypeScript routing and requires manual Swagger annotations.
3. **NestJS**: Heavily opinionated OOP boilerplate, decorator complexity, and slow startup; violates Ponytail simplicity rules.

## 4. Decision Outcome
Chosen option: **Hono**. It provides the fastest execution speed, minimal memory footprint, and tightest integration with Zod schemas for automatic OpenAPI documentation.

### Positive Consequences
- Automatic OpenAPI 3.1 schema generation from route definitions.
- Direct compatibility with standard Web Fetch APIs.
- Clean thin-handler patterns delegating to `packages/domain`.

### Negative Consequences / Trade-offs
- Smaller legacy middleware ecosystem compared to Express, but all essential middleware (CORS, rate limiting, session auth) is natively available.
