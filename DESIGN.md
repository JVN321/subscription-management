---
name: Brightloop Industrial Precision System
description: Precision-engineered, high-density financial operations interface
colors:
  primary: "#FF6B00"
  primary-hover: "#E55E00"
  primary-subtle: "#FFF5EE"
  neutral-canvas: "#F8F8F9"
  neutral-card: "#FFFFFF"
  neutral-subtle: "#F2F2F3"
  neutral-border: "#E5E5E5"
  neutral-border-subtle: "#EEEEEE"
  neutral-border-strong: "#18181B"
  text-primary: "#09090B"
  text-secondary: "#52525B"
  text-muted: "#9D9D9D"
  success: "#10B981"
  warning: "#F59E0B"
  danger: "#F43F5E"
typography:
  heading:
    fontFamily: "Lufga, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Lufga, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
---

## Overview

Brightloop's interface embodies an **Industrial Precision Design Language** inspired by technical instrument control consoles and modern financial operations systems. It prioritizes information density, crisp surface separation, restrained visual effects, and unambiguous numeric readability.

## Colors

The palette is strictly anchored by Safety Orange (`#FF6B00`), Pure White, and Deep Black, supported by technical grays:
- **Brand Accent**: `#FF6B00` (Safety Orange) - used exclusively for primary calls-to-action, active selection indicators, and key operational states.
- **Light Surface Canvas**: `#F8F8F9` (neutral technical ground).
- **Surface Panels**: `#FFFFFF` with thin `1px` borders (`#E5E5E5`).
- **Dark Surface Canvas**: `#09090B` with panels at `#121214` and borders at `#27272A`.
- **Status Indicators**: High-contrast, unmuted signals (Green `#10B981`, Amber `#F59E0B`, Rose `#F43F5E`).

## Typography

- **Primary Typeface**: **Lufga** — a modernist geometric grotesque with crisp horizontal terminals and high legibility at dense scales.
- **Monospace Typeface**: **JetBrains Mono** — applied to all financial currencies (`$1,560.00`), invoice numbers (`INV-99214`), subscription IDs, dates, and query latencies.
- **Hierarchy**: Restrained sizing; titles use `1.25rem`–`1.5rem` with tight line heights, metadata uses `0.75rem` uppercase tracking.

## Layout

- **Structured Operations Workspace**:
  - Compact header bar (`48px`–`52px`) featuring circular utility actions, role switchers, and light/dark toggles.
  - Sub-navigation via segmented flat pill tabs.
  - Multi-tier surface structure: Primary Metric Strip ➔ Central Main Operations Workspace ➔ Secondary Technical Information Panels.
  - Data tables designed for high row density, monospace alignment, and subtle horizontal borders.

## Elevation & Depth

- **Zero Heavy Drop-Shadows**: Elevation is established strictly through tonal surface contrast and `1px` boundary outlines.
- **No Gradients or Glassmorphism**: Surfaces are opaque, flat, and physical.

## Shapes

- **Corner Radii**: Subtle, restrained radii (`6px` for buttons, inputs, and chips; `8px` for panels). Avoid oversized circular pill shapes except for status dots and circular icon buttons.
- **Borders**: Thin `1px` continuous borders (`#E5E5E5` in light mode, `#27272A` in dark mode).

## Components

- **Button**: Compact (`32px`–`38px` height), subtle `1px` outlines, orange solid for primary action, circular icon buttons (`32px x 32px`) for utility actions.
- **Input & Select**: Flat background, crisp border, orange focus ring, no drop shadows.
- **Table**: Compact row padding (`8px`–`10px`), subtle hover tone (`#EBEBEB` light / `#26262B` dark), right-aligned financial columns.
- **Badge**: Minimalist outline badge with 6px status dot.

## Do's and Don'ts

### Do:
- Align numbers, decimals, and dates using monospace fonts.
- Use subtle separation lines between data sections instead of nesting cards inside cards.
- Keep icon buttons compact and circular.
- Maintain high contrast ratios (WCAG AAA).

### Don't:
- Never use emojis in labels, buttons, or headers.
- Never use colorful background gradients, glow effects, or blur backdrops.
- Never use oversized generic dashboard stat cards.
- Never use floating point numbers for financial amounts.
