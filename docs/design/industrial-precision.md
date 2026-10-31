# Industrial Precision Design System

> **Visual Language, Typography, and Design Tokens**  
> **Platform:** Brightloop Subscription Management System  
> **Updated:** 2026-10-31

---

## 1. Aesthetic Foundations

Brightloop's interface embodies **Industrial Precision**:
- **Geometry**: Sharp 1px borders, subtle 2px radii (`--radius-xs`), flat panels, zero gradients.
- **Color Palette**: Precision Orange (`#FF6B00`), Crisp White (`#FFFFFF`), Pitch Black (`#09090B`), Technical Gray dividers (`#E5E5E5` / `#27272A`).
- **Typography**: Geometric sans-serif **Lufga** across all weights for labels, paired with tabular monospace for monetary amounts.
- **Zero Decorative Slop**: No pulsing dots, no fake status labels, no emojis, no decorative counters.

---

## 2. CSS Design Tokens

```css
:root {
  /* Brand Accent */
  --brand-orange: #FF6B00;
  --brand-orange-hover: #E55F00;

  /* Typography */
  --font-sans: 'Lufga', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;

  /* Light Theme */
  --bg-app: #F8F8F9;
  --bg-panel: #FFFFFF;
  --bg-well: #F2F2F4;
  --border-subtle: #E5E5E5;
  --text-primary: #09090B;
  --text-secondary: #52525B;
  --text-muted: #71717A;

  /* Status Tokens */
  --status-success: #16A34A;
  --status-warning: #CA8A04;
  --status-danger: #DC2626;

  /* Geometry */
  --radius-xs: 2px;
  --radius-sm: 4px;
}

[data-theme='dark'] {
  --bg-app: #09090B;
  --bg-panel: #121214;
  --bg-well: #18181B;
  --border-subtle: #27272A;
  --text-primary: #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
}
```
