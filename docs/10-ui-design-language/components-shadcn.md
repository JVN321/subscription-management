# Shadcn Component Primitives & Styling Standards

> **Zero Bespoke Abstractions: Strict Shadcn Standard**

---

## 1. Component Rules

All interactive elements must follow shadcn conventions:

1. **Button**:
   - `primary`: Orange fill (`bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-md shadow-none`).
   - `secondary`: Neutral dark/light fill (`bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100`).
   - `outline`: Clean 1px border (`border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800`).
   - `ghost`: Transparent with hover background.
   - `destructive`: Red outline or muted red tint (`border border-red-500/30 text-red-600 dark:text-red-400`).

2. **Card**:
   - Rounded corners: `rounded-lg`.
   - Outlines: `border border-zinc-200 dark:border-zinc-800`.
   - Backgrounds: Solid `bg-white dark:bg-zinc-900`.
   - Elevation: `shadow-none` or `shadow-sm`. Never heavy drop-shadows or glow effects.

3. **Badge**:
   - Outlines: `border border-zinc-200 dark:border-zinc-700 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5`.
   - Indicator: 6px circular dot (`h-1.5 w-1.5 rounded-full`) indicating status.

4. **Table**:
   - Compact, high-density row heights (`py-3 px-4`).
   - Monospace numeric formatting for financial amounts (`font-mono tabular-nums`).
   - Outlines between rows (`border-b border-zinc-200 dark:border-zinc-800`).

5. **Icon Integration**:
   - Lucide icons sized to `16px` (`w-4 h-4`) or `18px` (`w-[18px] h-[18px]`) with `strokeWidth={1.75}`.
   - Zero emojis anywhere.
