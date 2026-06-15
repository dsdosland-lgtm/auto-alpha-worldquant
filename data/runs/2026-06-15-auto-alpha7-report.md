# /auto-alpha7 Run Report — 2026-06-15

submitted: 3
queued: 0

## Submitted Alphas

| # | alpha_id | Sharpe | Fitness | TO | self_corr | กลไก |
|---|----------|--------|---------|-----|-----------|------|
| 68 | xAnZ1eAJ | 1.98 | 1.13 | 0.205 | 0.614 (margin 0.086 FAT) | NET-INCOME-QUALITY ts_zscore(income/op_income) × close-range |
| 69 | QPQ8Yz3g | 2.07 | 1.31 | 0.185 | 0.6832 (margin 0.017 thin) | CORE-EARNINGS-QUALITY ts_zscore((income-spi)/|income|) × close-range |
| 70 | A13Az7Ww | 2.02 | 1.26 | 0.202 | 0.6813 (margin 0.0187 thin) | DSO-TEMPORAL-QUALITY ts_zscore(-receivable/sales) × VWAP |

## Pool Status

- Pool before: 67 ACTIVE alphas (9 original + 58 ours)
- Pool after: **70 ACTIVE alphas** (9 original + 61 ours)

## Key Lessons This Session

1. **ts_av_diff ≈ ts_rank of SAME fundamental**: corr 0.82-0.91 even with different price niche. ZYoJmY9Z ts_av_diff(cost-of-debt) × VWAP = 0.8262 vs e7rjgA8J ts_rank(cost-of-debt) × close-range. ts_av_diff only orthogonal when applied to completely different fundamental not in pool.

2. **Accruals family fully saturated**: total-accruals #61 Sloan, accrual-quality-variance #48, net-income-quality #68, core-earnings #69, op-accruals ts_zscore (0.91 vs #61), CFO/sales (0.73 vs #61). Any signal using (income vs CFO) comparison loads this family.

3. **Gross margin = profitability proxy**: ts_zscore(gross_margin) → 0.74-0.88 corr with op-margin pool (#41 ts_rank, #44 ts_rank) because within INDUSTRY-neutral context, SGA/sales is stable → gross_margin ≈ op_margin + constant. CONFIRMED proxy flagged.

4. **DPO level ≈ ΔDPO (0.79 corr)**: AP/cogs level (ts_zscore construction, VWAP) still 0.79 vs ΔDPO #40 (group_rank, close-range). Payables timing = dimension, not just construction.

5. **Revenue recognition quality loads ΔDPO (0.79)**: ΔDR/sales - ΔSales/sales captures billing/collection dynamics same as payables-timing ΔDPO family.

6. **Income volatility (income/sales std_dev) = earnings-smoothing dim**: 0.78 vs #67 mLXv5rJ9. Denominator change (sales vs assets) insufficient when numerator and variance-window are same.

7. **DR-analogy confirmed (#70)**: ts_zscore(-AR/sales) temporal ⊥ group_rank(-DSO) cross-sectional #28 (max corr 0.6813). Analogous to DR ts_rank #50 ⊥ DR group_rank #8 (0.52). **Construction differentiation (temporal vs cross-sectional) creates genuine orthogonality for the SAME ratio.**

## Failed Candidates (11 sims)

| alpha_id | verdict | reason |
|----------|---------|--------|
| MPxr6j9L | redundant | corr 0.79 vs ΔDPO (rev-recognition = billing-timing dim) |
| 0m8JGAO8 | redundant | corr 0.91 vs #61 Sloan (op-accruals ≈ total-accruals) |
| 1YgMG6VQ | rejected | IS fail Fitness 0.72 (ts_av_diff ATO weak) |
| mLXvdJXE | rejected | sub-universe fail 0.56 vs 0.89 (gross-margin-stability weak sub) |
| KPL1vZqj | rejected | sub-universe fail 0.39 vs 0.90 (op-margin-stability weak sub) |
| vRmQZNNd | redundant | corr 0.77 vs #59 REM (COGS-dim + rev60 double binding) |
| KPL15nYj | redundant | corr 0.74 vs #44 op-margin (gross-margin = profitability proxy) |
| QPQ8NKbG | redundant | corr 0.79 vs #40 ΔDPO (DPO level = same payables-timing dim) |
| O093zzj1 | rejected | IS fail Fitness 0.99 (ATO ts_zscore borderline) |
| 9qRnmozq | redundant | corr 0.78 vs #67 earnings-smoothing (income-margin-vol same dim) |
| ZYoJmY9Z | redundant | corr 0.83 vs #62 cost-of-debt (ts_av_diff≈ts_rank SAME fundamental!) |

## Next Opportunities

- DSO temporal quality proved the **temporal-vs-cross-sectional construction differentiation** pattern works
- Remaining fresh temporal ratios to try: inventory-level temporal (#57 uses cogs/inv cross-section), ATO temporal (Fitness 0.99 borderline — try tuning), receivables-quality extensions
- VWAP cluster still has capacity (check pool for remaining fresh fundamentals × VWAP)
- Rev60 cluster (3 members now): next member needs 3:1 weight (fund-heavy to dilute price-leg overlap)
