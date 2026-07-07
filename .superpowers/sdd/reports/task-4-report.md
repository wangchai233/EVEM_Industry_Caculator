# Task 4 Report: 计算引擎

## Status: ✅ COMPLETED

## Summary
Created 3 pure-function engine modules for manufacturing, reverse engineering, and selling calculations. All files pass TypeScript strict mode compilation with zero errors.

## Files Created

| File | Lines | Exports |
|------|-------|---------|
| `src/engine/manufacturing.ts` | 81 | `calculateManufacturing(config, bp, decoder, getPrice) → ProductionResult` |
| `src/engine/reverse.ts` | 87 | `calculateReverse(config, revData, decoder, getPrice) → ProductionResult & { successRate, expectedCost }` |
| `src/engine/selling.ts` | 68 | `calculateMarketSelling(config, cost) → SellingResult`<br>`calculateContractSelling(config, cost) → SellingResult` |

## Verification

- **TypeScript**: `npx tsc --noEmit` — **PASSED** (exit code 0, no errors)
- **Strict mode flags** checked: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `verbatimModuleSyntax: true` — all satisfied
- All imports use correct `import type` for type-only imports, regular `import` for values (`getItemById`)
- All type annotations verified against `src/types/` interfaces

## Commit

```
ebcee93 feat: add calculation engine (manufacturing, reverse, selling)
3 files changed, 236 insertions(+)
```

## Key Design Notes

1. **manufacturing.ts**: Treats the blueprint itself as a base material (isBaseMaterial: true). Decoder cost and time bonuses applied via `decoder?.runBonus` and `decoder?.teBonus`. Material efficiency only applied to non-base materials.
2. **reverse.ts**: Success rate capped at 1.0 via `Math.min()`. Expected cost = single-run cost / success rate. Decoder cost is one-time (quantity 1).
3. **selling.ts**: Market mode: broker fee 1% (waived for immediate sell), sales tax per config. Contract mode: broker fee 4% (min 1000 ISK), deposit 2.5% (min 10000 ISK), no sales tax.

## Concerns

None. All three modules are pure functions with no side effects, no external dependencies beyond the project's own types and data modules.

## Report Path

`d:\Trae_Projects\EVEM_Industry_Calc\.superpowers\sdd\reports\task-4-report.md`
