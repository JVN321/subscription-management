# ADR 0008: Single-Business vs Multi-Tenant SaaS

- **Status**: **Proposed / Pending Decision**
- **Date**: 2026-10-31
- **Deciders**: Brightloop Product Management, Architecture Team
- **Component**: Data Model, Schema, Authorization

---

## 1. Context and Problem Statement
The source problem statement specifically models the internal operations of **Brightloop Software** (a single company). However, discussions have explored whether this platform should be built as a multi-tenant SaaS application allowing multiple external companies to run their subscription businesses on the platform.

A formal product decision is required before database schemas and authorization middleware are locked.

---

## 2. Options Under Review

### Option 1: Single-Business Architecture (Recommended for Initial Release)
The system is built specifically for Brightloop Software:
- User roles: Admin, Staff, Customer.
- Customer accounts belong directly to Brightloop.
- Tables do not require `organization_id` discriminator columns.
- Simpler queries, lower cognitive load, faster initial time-to-market.

### Option 2: Multi-Tenant SaaS Architecture
The system allows multiple organizations (tenants) to manage independent subscription businesses:
- Every table (`customers`, `products`, `plans`, `subscriptions`, `invoices`, `payments`, `discounts`) carries an `organization_id` foreign key.
- Row-Level Security (RLS) or application-level tenant isolation middleware must enforce that users cannot query across tenant boundaries.
- Cache keys must be scoped by tenant: `org:{orgId}:dashboard:summary`.

---

## 3. Trade-off Comparison

| Dimension | Option 1: Single-Business | Option 2: Multi-Tenant SaaS |
|---|---|---|
| **Alignment with Source PDF** | 100% matches Brightloop problem statement | Speculative requirement not in source PDF |
| **Schema Complexity** | Minimal, straightforward foreign keys | Requires `organization_id` on every table & composite unique keys |
| **Security Risk** | Low (Customer vs Staff isolation only) | High (Risk of cross-tenant data leakage if filters omit tenant ID) |
| **Time to Market** | Fast, Ponytail compliant | Requires tenant onboarding, memberships, and billing |

---

## 4. Recommendation
In strict accordance with the **Ponytail Principle (YAGNI)**, we recommend **Option 1 (Single-Business)** for the initial implementation. We will design clean module boundaries so that if multi-tenancy is approved in the future, adding `organization_id` can be performed via a clean migration.
