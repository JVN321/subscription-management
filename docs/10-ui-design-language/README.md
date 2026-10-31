# UI Design Language & Anti-Slop System

> **Status: Authoritative Design Standard**
>
> Precise, minimal, and high-contrast design system governing all client-facing and internal interfaces in Brightloop.

---

## 1. Core Principles

1. **Anti-Slop & Zero Gradients**:
   - No colorful rainbow gradients, no glassmorphism blur traps, no fake "AI styling".
   - Clean, modern, flat surfaces defined by sharp, crisp outlines (`1px` borders).
2. **Authoritative Palette: Orange, White, Black**:
   - **Primary Brand Accent**: Precision Orange (`#f97316` / `#ea580c`).
   - **Light Mode**: Pure White backgrounds (`#ffffff`, `#fafafa`), Dark Charcoal text (`#09090b`), Light Zinc borders (`#e4e4e7`).
   - **Dark Mode**: True Pitch Black / Zinc 950 backgrounds (`#09090b`, `#18181b`), White text (`#fafafa`), Dark Zinc borders (`#27272a`).
3. **No Emojis Policy**:
   - Emojis (🚀, 💰, ⏱️, 🔔) are strictly forbidden in UI elements, buttons, badges, and headers.
   - All visual indicators must use crisp, monochrome vector icons from `lucide-react`.
4. **Shadcn UI Standard**:
   - Components adhere strictly to shadcn design primitives:
     - `Button`: Outline, Ghost, Primary (Solid Orange or Neutral Dark).
     - `Badge`: Flat outline with subtle tint, never saturated neon pills.
     - `Card`: Crisp outline, 0px or 1px subtle elevation, no drop shadow bloat.
     - `Table`: Flat striped/bordered layout with monospace financial figures.
     - `Tabs`: Segmented outline or underline pill tabs.
     - `Dialog`: Flat backdrop with sharp modal card.
5. **Reactivity**:
   - Immediate feedback on all interactions (mutations, triggers, tab switches, filters).
   - Dedicated Light/Dark mode switcher with persistent state.

---

## 2. Directory Structure

```text
docs/10-ui-design-language/
├── README.md                      # Overview & core principles (this file)
├── color-system.md                # Orange, White, Black tokens & contrast ratios
├── components-shadcn.md           # Component specifications & props
└── typography-and-spacing.md      # Font hierarchy, numeric tabular alignment, grids
```
