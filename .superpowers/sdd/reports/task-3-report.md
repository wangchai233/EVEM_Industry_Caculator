# Task 3 报告: 内置默认数据

## 状态: ✅ 完成

## 提交
- **Commit**: `39aa740` — `feat: add built-in demo data (3-5 products)`
- **分支**: `main`

## 文件
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/data/items.ts` | 新建 | 15 个物品 + 3 个解码器 |
| `src/data/blueprints.ts` | 新建 | 2 个制造蓝图 + 2 个产物物品 |
| `src/data/reverse.ts` | 新建 | 2 个逆向工程配置 |
| `src/data/index.ts` | 新建 | Map 索引 + 4 个查询函数 |

## 验证
- `npx tsc --noEmit` — **通过** (exit code 0)

## 自审检查清单
- [x] `defaultItems` 包含 7 种矿物、3 种行星产物、2 种数据核心、2 种受损结构、ISK
- [x] `defaultDecoders` 包含 3 种解码器（none / me_1 / run_1）
- [x] `defaultBlueprints` 包含 T9 战列舰蓝图（10 种材料）和 T8 巡洋舰蓝图（7 种材料）
- [x] `blueprintProducts` 定义了 2 个产物物品（t9_battleship, t8_cruiser）
- [x] `defaultReverse` 包含 2 个逆向工程配置（T9 BS / T8 CR）
- [x] `allItems` 合并了 defaultItems + defaultDecoders + blueprintProducts
- [x] 4 个查询函数（getItemById, getBlueprintById, getReverseById, getDecoderById）均基于 Map 实现 O(1) 查找
- [x] 所有 re-export 均正确从 `src/data/index.ts` 导出
- [x] 类型导入全部使用 `import type` 以避免运行时开销

## 数据规模
- 物品总数: 20（15 材料 + 3 解码器 + 2 产物）
- 蓝图: 2
- 逆向配置: 2
- 解码器: 3

## 关注点
无。文件与 brief 完全一致，TypeScript 编译零错误。
