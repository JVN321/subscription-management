# ADR 0005: Better Auth for Authentication and Identity

- **Status**: **Confirmed**
- **Date**: 2026-10-31
- **Deciders**: Architecture Team, Brightloop Engineering
- **Component**: `apps/api`, `apps/web`

---

## 1. Context and Problem Statement
The application requires user signup, email verification, password complexity enforcement (>8 characters, uppercase, lowercase, special character), password resets via email, session management, and RBAC (Admin, Staff, Customer).

## 2. Decision Drivers
- Battle-tested library: Never hand-roll authentication, password hashing, or session token generation.
- Framework independence: Works across both Hono API and TanStack Start frontend.
- Drizzle ORM native adapter: Stores users and sessions directly in PostgreSQL.

## 3. Considered Options
1. **Better Auth**: Modern TypeScript auth framework with first-class Drizzle and Hono support.
2. **NextAuth / Auth.js**: Heavily tied to Next.js; difficult to integrate with pure Hono API and TanStack Start.
3. **Custom Hand-Rolled JWTs**: High risk of security vulnerabilities (replay attacks, invalid revocation, weak hashing).

## 4. Decision Outcome
Chosen option: **Better Auth**. It provides production-ready session management, password resets, and role integration while keeping user data in our own PostgreSQL database.
