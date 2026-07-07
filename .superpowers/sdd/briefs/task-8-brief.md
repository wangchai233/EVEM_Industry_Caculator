### Task 8: 布局框架 + Header + 导入导出栏

**Files:**
- Modify: `src/App.tsx`, `src/App.module.css`
- Create: `src/components/Header/Header.tsx`, `src/components/Header/Header.module.css`
- Create: `src/components/ImportExportBar/ImportExportBar.tsx`, `src/components/ImportExportBar/ImportExportBar.module.css`

**IMPORTANT: The full code for each file is in the plan at `docs/superpowers/plans/2026-07-07-evem-industry-calc-plan.md`. Read the Task 8 section from there for complete code. This brief summarizes the requirements.**

- [ ] **Step 1: Write Header.tsx** — app title + price config dropdown + management modal (create/rename/delete/switch price configs)
- [ ] **Step 2: Write Header.module.css** — dark theme styling with modal overlay
- [ ] **Step 3: Write ImportExportBar.tsx** — export JSON, import JSON (file picker + validation), reset button
- [ ] **Step 4: Write ImportExportBar.module.css** — bottom bar styling
- [ ] **Step 5: Update App.tsx** — wrap with providers (AppProvider, ProductionProvider, SellingProvider), layout: Header + main (left/right panels) + ImportExportBar
- [ ] **Step 6: Write App.module.css** — flex column layout, main with two flex panels, mobile @media (max-width: 767px) stacks vertically
- [ ] **Step 7: Verify** — `npx tsc --noEmit` and `npm run dev` 
- [ ] **Step 8: Commit** — `git add src/App.tsx src/App.module.css src/components/Header/ src/components/ImportExportBar/ ; git commit -m "feat: add layout framework, header, and import/export bar"`

Read the full code from the plan file at `docs/superpowers/plans/2026-07-07-evem-industry-calc-plan.md` — search for "### Task 8" and use the exact code provided there.
