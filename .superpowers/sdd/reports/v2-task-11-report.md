# v2 Task 11 Report — 更新现有生产/出售面板组件

**Date:** 2026-07-08
**Status:** ✅ Complete

## Changes Made

### 1. DecoderSelector.tsx
- Filter decoders by `mfg`/`rev` category based on current project type (manufacturing vs reverse)
- Added "无解码器" (no decoder) option at the top of the select
- Changed preview labels from English (`ME:`, `TE:`) to Chinese (`材料效率:`, `时间效率:`, `流程:`, `成功率:`)
- Source: imports from `../../data/decoders` for the new v2 decoder list

### 2. ProductionSummary.tsx
- Added number input alongside range slider for custom runs in manufacturing mode (`customRuns` flag)
- Added parallel runs number input for reverse engineering mode
- Added success rate display for reverse engineering results
- Added expected cost display for reverse engineering results

### 3. MaterialList.tsx
- Added "折扣" (discount) column to the material table
- Allows per-item discount override as percentage (1-100)
- Stored in AppContext as `materialDiscounts: Record<string, number>`
- Follows three-tier priority: 手动覆写 > 材料清单 > 全局 (manual override > material list > global)

### 4. ProductionPanel.tsx
- Integrated `resolveBonuses()` from `src/engine/resolver.ts` in useEffect
- Gets `productTags` from `bp.tags` (manufacturing) or `rev.tags` (reverse)
- Resolves decoder from `getDecoderById()` instead of old `getDecoderById` with fallback
- Passes `BonusLayers` to both `calculateManufacturing()` and `calculateReverse()`
- Passes `getDiscount` to `calculateManufacturing()` for material discount support
- Added `skillLevels`, `customFacility`, `getDiscount` to useEffect dependencies

### 5. MarketSellConfig.tsx / ContractSellConfig.tsx
- Added "出售折扣" (sell discount) input field to both components
- Stores discount override in `SellingContext.state.discountOverride`
- Uses `SET_DISCOUNT_OVERRIDE` action for state management

### 6. SellingPanel.tsx
- Updated useEffect to apply `discountOverride` to effective sell price before engine calculation
- Added `state.discountOverride` to dependency array

### 7. AppContext.tsx (supporting changes)
- Added `materialDiscounts` state (localStorage persisted)
- Added `setMaterialDiscount(itemId, rate|null)` method
- Added `clearMaterialDiscount(itemId)` method
- Updated `getDiscount()` to check material discounts first (three-tier priority)
- Exposed new state/methods via Provider value

## Verification
- `npx tsc --noEmit`: ✅ Passed (exit code 0, no errors)

## Files Modified
- `src/components/ProductionPanel/DecoderSelector.tsx`
- `src/components/ProductionPanel/ProductionSummary.tsx`
- `src/components/ProductionPanel/MaterialList.tsx`
- `src/components/ProductionPanel/ProductionPanel.tsx`
- `src/components/SellingPanel/MarketSellConfig.tsx`
- `src/components/SellingPanel/ContractSellConfig.tsx`
- `src/components/SellingPanel/SellingPanel.tsx`
- `src/state/AppContext.tsx`

## Concerns
- None. All changes are backward-compatible with existing data structures.
- The `materialDiscounts` state was added to AppContext as a supporting change for MaterialList's discount column — this was not explicitly mentioned in the task's commit command but is required for the MaterialList changes to compile.
