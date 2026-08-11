# Project Behavioral Rules & Guidelines

## Responsive Design Requirement (Mandatory)
- Every UI component, layout, page, modal, table, and form added or modified must be 100% responsive across all screen sizes (mobile `<640px`, tablet `640px-1024px`, and desktop `>1024px`).
- Use modern responsive design best practices:
  - Mobile-first or responsive-first layout principles using Tailwind CSS utilities (`sm:`, `md:`, `lg:`, `xl:`).
  - Touch-friendly tap targets (`min-h-[44px]`, comfortable padding, accessible buttons).
  - Collapsible mobile navigation drawers/menus for headers and navigation bars.
  - Horizontal scrolling containers, card grids, or stacked layouts for data tables on small screens.
  - Responsive typography, image aspect ratios (`object-contain` / `object-cover`), and dynamic modal sizing (`w-full max-w-lg px-4`).
