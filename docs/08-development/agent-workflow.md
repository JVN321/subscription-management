# AI Agent Workflow & Protocol

> **Status: Confirmed Agent Operating Procedure**
>
> Operational directives and workflows for AI agents (Antigravity, Claude Code, Cursor, and subagents) contributing to this repository.

---

## 1. Primary Operating Rules

All automated agents working in this repository must align with `AGENTS.md` in the project root:

1. **Ponytail Simplicity Rule**:
   - Never write bespoke implementations when battle-tested libraries already solve the problem (Better Auth, Drizzle, BullMQ, Zod, PDFKit, Resend).
   - Reject unrequested abstractions, extra design patterns, and premature generalizations.
2. **Database Integrity & Review Protocol**:
   - Always review database code before applying edits: verify decimal precision (`NUMERIC(14, 4)`), transaction boundaries (`db.transaction`), foreign keys, and unique indexes.
   - Zero floating-point math for money.
3. **Skill Discovery & Autonomous Installation**:
   - Agents are authorized to inspect, install, and execute skills in `.agents/skills/` or per-project when complex specialized workflows arise.
4. **CodeGraph First Lookup**:
   - Before using `grep`, `find`, or sequentially reading files to understand code symbols, query CodeGraph:
     - MCP: `codegraph_explore`
     - CLI: `codegraph explore "<symbol or question>"`
   - Always run `codegraph sync .` after creating or editing files.

---

## 2. Agent Every-Edit Checklist

Before returning a response or claiming completion of a task:
- [ ] **Ponytail Check**: Did I write the shortest working diff without unrequested abstractions?
- [ ] **Library-First Check**: Did I reuse existing libraries rather than writing custom code?
- [ ] **Database Integrity**: Are all financial updates wrapped in transactions with decimal precision?
- [ ] **CodeGraph Sync**: Ran `codegraph sync .` to update the knowledge graph.
- [ ] **Documentation Parity**: Updated `docs/` if any API route, database schema, or job changed.
- [ ] **Type & Lint Safety**: Verified TypeScript compiles without errors.
