# Color System: Orange, White, Black

> **Precision Monochromatic Palette with High-Visibility Safety Orange Accent**

---

## 1. Palette Specification

The interface is anchored around three core tones: **Safety Orange**, **Crisp White**, and **Deep Black**, supported by neutral Zinc steps for subtle outlines and secondary text.

```text
Accent:
  --color-orange-500: #f97316 (Primary Accent / Focus rings / Active tabs)
  --color-orange-600: #ea580c (Active hover / Pressed buttons)
  --color-orange-50:  #fff7ed (Subtle accent highlight in light mode)
  --color-orange-950: #431407 (Subtle accent highlight in dark mode)

Light Mode (Default):
  --bg-primary:    #ffffff (Pure White canvas)
  --bg-secondary:  #fafafa (Card surfaces & header background)
  --bg-muted:      #f4f4f5 (Input background & inactive states)
  --border:        #e4e4e7 (Sharp 1px outline)
  --border-focus:  #f97316 (Orange focus indicator)
  --text-primary:  #09090b (Deep Charcoal / Black)
  --text-muted:    #71717a (Neutral 500 secondary typography)

Dark Mode:
  --bg-primary:    #09090b (Deep Pitch Black canvas)
  --bg-secondary:  #18181b (Card surfaces & table rows)
  --bg-muted:      #27272a (Input background & inactive states)
  --border:        #27272a (Sharp 1px outline)
  --border-focus:  #f97316 (Orange focus indicator)
  --text-primary:  #fafafa (Pure Off-White)
  --text-muted:    #a1a1aa (Neutral 400 secondary typography)
```

---

## 2. Contrast & Accessibility Guidelines

1. **WCAG AAA Contrast**:
   - All text vs background must exceed 7:1 for body copy and 4.5:1 for large headers.
   - Financial numbers use `--text-primary` with `font-mono` to prevent optical ambiguity.
2. **Status Accents**:
   - Success (`PAID`, `ACTIVE`): Neutral outline with Emerald dot or badge (`#10b981`).
   - Warning (`OVERDUE`, `PAUSED`): Neutral outline with Amber dot or badge (`#f59e0b`).
   - Urgent / Error (`CLOSED`, `FAILED`): Neutral outline with Rose dot or badge (`#f43f5e`).
   - Brand / Primary (`CONFIRMED`, `SENT`): Precision Orange outline or badge (`#f97316`).
