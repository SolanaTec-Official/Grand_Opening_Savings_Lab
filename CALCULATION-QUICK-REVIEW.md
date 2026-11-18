# Savings Lab V3 — Calculation Quick Review

**Purpose:** A short professional review of the calculation currently used by the website.  
**Status:** Illustrative estimate only; figures below have not yet been professionally certified.  
**Detailed reference:** `CALCULATION-METHODOLOGY.md`

## Calculation overview

| Stage | How the website calculates it |
|---|---|
| 1. Bill → electricity use | The monthly bill is converted to estimated kWh. Bills below RM472 use an embedded TNB bill lookup table. Higher bills use reverse-calculation formulas. Bills from RM721 to RM880 currently all become exactly **1,501 kWh**. |
| 2. Supply phase | The user selects single- or three-phase. If “Not sure” is selected, bills below RM400 become single-phase and bills of RM400 or more become three-phase. |
| 3. Solar yield | The selected town supplies a monthly yield of **96, 99, or 106.5 kWh per kWp**. |
| 4. Panel quantity | `floor(monthly kWh ÷ location yield ÷ 0.65 kWp)`. The result is constrained to 8–23 panels for single-phase and 8–47 for three-phase. Three-phase hybrid/battery systems have a minimum of 13 panels. |
| 5. Solar generation | Normally: `panels × 0.65 kWp × location yield`. Special rules are used for 27 and 28 panels. |
| 6. Direct solar use | `minimum(daytime-use percentage × monthly consumption, solar generation)`. Daytime share can be 10%–70%. |
| 7. Battery storage | Battery option only: up to **388.8 kWh/month**, based on `16 kWh × 90% × 90% × 30 days`. |
| 8. Grid import/export | `Export = generation − direct use − stored energy`. `Import = consumption − direct use − stored energy`, with negative import changed to zero. |
| 9. New electricity bill | A tariff lookup/formula is applied to grid import. Export credit is RM0.2703/kWh below 1,501 kWh import or RM0.3703/kWh from 1,501 kWh, capped at the lower of export or import. The bill cannot go below RM0. |
| 10. Monthly savings | `Original entered bill − estimated new bill`. |
| 11. System price | `Base package price × 88% − two months of calculated savings + hybrid addition + battery addition`. Battery addition after promotion is RM8,000. |
| 12. Simple payback | `Estimated system price ÷ (monthly savings × 12)`. No financing, degradation, maintenance, replacement, inflation, or tariff escalation is included. |

## Major assumptions

- Each panel is **650 W**.
- Location yields:
  - 96: Johor Bahru, Pontian, Kota Tinggi, Kulai
  - 99: Batu Pahat, Kluang, Mersing, Segamat
  - 106.5: Melaka, Muar, Tangkak
- Cash discount: **12%**.
- Battery: **16 kWh nominal**, with two 90% efficiency factors.
- Solar-only and hybrid-ready options produce the same energy savings when their panel counts match; the hybrid option changes price only.
- The battery option is always labelled **Recommended**. The website does not calculate which option is objectively best.
- The calculation uses monthly totals rather than hourly household demand and solar-generation profiles.

## Default website example

**Input:** RM400 bill, “Not sure” phase, 30% daytime use, Johor Bahru.

- Resolved phase: three-phase
- Estimated consumption: 861 kWh/month
- System: 13 panels, 8.45 kWp
- Estimated generation: 811.2 kWh/month

| Option | New bill | Monthly saving | Estimated price | Simple payback |
|---|---:|---:|---:|---:|
| Solar only | RM128.91 | RM271.09 | RM19,035.19 | 5.85 years |
| Hybrid ready | RM128.91 | RM271.09 | RM24,135.19 | 7.42 years |
| Solar + battery | RM38.30 | RM361.70 | RM31,953.96 | 7.36 years |

The website rounds the primary battery result to **RM362/month saving, RM38 new bill, 13 panels, 8.4 kWp, and 7.4 years**.

## Items needing a quick professional decision

Please confirm or correct these items first:

1. Is the embedded TNB tariff table current and complete, including applicable charges, incentives, taxes, and export rules?
2. Is mapping every bill from RM721 to RM880 to exactly 1,501 kWh intentional?
3. Is the export-credit calculation—including the added `EEI` amount—correct?
4. Are the town yields of 96, 99, and 106.5 kWh/kWp/month approved?
5. Are the panel minimums, phase limits, and special 27/28-panel generation formulas correct?
6. Is the battery assumption of 388.8 kWh usable throughput per month appropriate?
7. Should the system price deduct `2 × monthly savings`, causing the same hardware price to vary by customer usage?
8. Should the battery option always be shown as recommended, or should the recommendation be calculated from cost, payback, and backup needs?

If these eight decisions are confirmed, the detailed document can be used for the remaining line-by-line validation.
