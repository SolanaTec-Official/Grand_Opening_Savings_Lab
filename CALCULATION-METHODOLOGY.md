# Solana Tec Savings Lab V3 — Calculation Methodology

**Document date:** 18 November 2026  
**Implementation documented:** `Solar_calculator_game_V3`  
**Primary calculation source:** `js/savings-lab-calculator.js`  
**Interface and rounding source:** `js/savings-lab-app.js`

## 1. Purpose and status

This document describes the calculation currently performed by the website. It is an implementation record for technical and commercial review; it does **not** certify that the tariff, solar-yield, battery, pricing, or payback assumptions are correct.

The calculation file contains comments referring to spreadsheet locations such as `TNB Bill!C`, `Mono Calc!B81`, and `Inverter!C92`, but that source workbook is not included in V3. Those assumptions therefore need to be checked against the current approved professional source.

## 2. User inputs and normalization

| Input | Choices or range | Internal treatment |
|---|---:|---|
| Monthly TNB bill | RM50–RM3,000 in the interface | Rounded to the nearest RM10 and clamped to RM50–RM3,000 by the interface. The calculation API itself accepts RM50–RM5,000. Default: RM400. |
| Electricity supply | Single-phase, three-phase, or not sure | “Not sure” always resolves to three-phase. Default: not sure. |
| Daytime electricity share | 10%–70%, in 5-point slider steps | Stored as a ratio from 0.10 to 0.70. Presets are 15%, 30%, and 50%. Default: 30%. |
| Location | 11 towns | Selects the monthly energy-yield assumption shown in section 4. Default: Johor Bahru. |

The bill minus/plus buttons change the bill by RM50. The preset bill buttons are RM300, RM500, RM700, and RM1,000.

## 3. End-to-end calculation flow

For each user profile, the website performs this sequence:

1. Convert the entered monthly bill into estimated monthly electricity consumption in kWh.
2. Resolve the supply phase if “not sure” was selected.
3. Select a location-specific monthly solar yield in kWh/kWp/month.
4. Calculate a raw panel recommendation and constrain it to the phase-specific limits.
5. Calculate three proposals:
   - solar only with an on-grid inverter;
   - solar with a hybrid-ready inverter;
   - solar with a hybrid inverter and battery backup.
6. Split solar generation into direct daytime use, battery-stored energy, and export.
7. Estimate the post-solar bill from grid import and export credit.
8. Calculate monthly savings, estimated system price, and simple payback.
9. Present the battery proposal as the primary “recommended” result and show all three proposals for comparison.

The website does not dynamically rank the three proposals. The battery proposal is always marked as recommended.

## 4. Constants and location assumptions

### 4.1 Solar module

- Module rating: **650 W per panel**
- System size in kWp: `panel count × 650 / 1,000`

### 4.2 Monthly solar yield

The code comment describes these as yield assumptions for a roof inclination of 15–35 degrees.

| Area code | Location | Yield (kWh/kWp/month) |
|---|---|---:|
| `JB` | Johor Bahru | 96.0 |
| `BATU_PAHAT` | Batu Pahat | 99.0 |
| `MELAKA` | Melaka | 106.5 |
| `MUAR` | Muar | 106.5 |
| `KLUANG` | Kluang | 99.0 |
| `PONTIAN` | Pontian | 96.0 |
| `KOTA_TINGGI` | Kota Tinggi | 96.0 |
| `KULAI` | Kulai | 96.0 |
| `MERSING` | Mersing | 99.0 |
| `SEGAMAT` | Segamat | 99.0 |
| `TANGKAK` | Tangkak | 106.5 |

An unrecognized area falls back to Johor Bahru at 96.0 kWh/kWp/month.

### 4.3 Battery

- Nominal unit: **16 kWh**
- First efficiency factor: **90%**
- Second efficiency factor: **90%**
- Usable energy assumed per day: `16 × 0.9 × 0.9 = 12.96 kWh`
- Maximum stored solar energy assumed per month: `12.96 × 30 = 388.8 kWh`
- Listed battery cost: RM10,800
- Battery promotion: −RM2,800
- Net battery addition used by the calculator: **RM8,000**

## 5. Bill-to-consumption conversion

Let:

- `B` = entered monthly bill in RM;
- `C` = estimated monthly consumption in kWh;
- `T[k]` = the embedded bill lookup value at integer consumption `k`.

### 5.1 Bills below RM472

For `B < 472`, the calculator searches the embedded 1,002-entry lookup table and returns the greatest integer `k` from 0 to 1,001 for which:

`T[k] ≤ B`

The exact lookup table is stored in `BILL_TABLE` in `js/savings-lab-calculator.js`. The following is a compact audit summary; it does not replace the exact stored entries.

| kWh band | First stored value (RM) | Last stored value (RM) | Approx. increment within band (RM/kWh) |
|---:|---:|---:|---:|
| 1–200 | 0.1943 | 38.8600 | 0.19430 |
| 201–250 | 40.0593 | 49.8250 | 0.19930 |
| 251–300 | 55.0443 | 65.7900 | 0.21930 |
| 301–350 | 71.6527 | 83.3171 | 0.23805 |
| 351–400 | 97.8198 | 111.4755 | 0.27869 |
| 401–450 | 121.9396 | 136.8400 | 0.30409 |
| 451–500 | 148.5994 | 164.7444 | 0.32949 |
| 501–550 | 172.7091 | 189.6008 | 0.34473 |
| 551–600 | 198.3428 | 215.9813 | 0.35997 |
| 601–650 | 236.4900 | 256.3229 | 0.40475 |
| 651–700 | 270.0376 | 290.9446 | 0.42667 |
| 701–750 | 298.5742 | 320.0182 | 0.43763 |
| 751–800 | 324.3313 | 346.0438 | 0.44311 |
| 801–850 | 358.9354 | 381.4535 | 0.45955 |
| 851–900 | 395.1835 | 418.5071 | 0.47599 |
| 901–1,000 | 423.6806 | 471.3464 | 0.48147 |
| 1,001 | 476.9200 | 476.9200 | — |

The table includes discontinuous jumps at several band boundaries. These stored values should be checked against the approved tariff model.

### 5.2 Bills from RM472 upward

The following formulas are used exactly as written in the code:

For `472 ≤ B < 721`:

`C = (((B / 1.016 − 266.58) × (100 / 108)) − 10 + 266.58) / 0.4443`

For `721 ≤ B ≤ 880`:

`C = 1,501`

For `B > 880`:

`C = (((B / 1.016 − 326.58) × (100 / 108)) − 10 + 326.58) / 0.5443`

The fixed value of 1,501 kWh for every bill from RM721 through RM880 is an important review item.

## 6. Energy-efficiency incentive lookup

The post-solar bill formula uses a rate selected from this step table according to grid-import kWh:

| Import threshold (kWh) | Rate (RM/kWh) |
|---:|---:|
| 0 | 0.250 |
| 201 | 0.245 |
| 251 | 0.225 |
| 301 | 0.210 |
| 351 | 0.170 |
| 401 | 0.145 |
| 451 | 0.120 |
| 501 | 0.105 |
| 551 | 0.090 |
| 601 | 0.075 |
| 651 | 0.055 |
| 701 | 0.045 |
| 751 | 0.040 |
| 801 | 0.025 |
| 851 | 0.010 |
| 901 | 0.005 |
| 1,001 | 0.000 |

The calculator calls this value `EEI`. Its use in the post-solar bill calculation is described in section 9 and should be professionally verified.

## 7. Panel sizing

Let:

- `Y` = the selected location yield in kWh/kWp/month;
- `C` = estimated monthly consumption;
- `W` = 0.65 kWp per panel.

Raw recommendation:

`Nraw = floor(C / Y / W)`

Solar-only panel count:

- single-phase: `N = clamp(Nraw, 8, 15)`
- three-phase: `N = clamp(Nraw, 8, 47)`

Hybrid and battery panel count:

- single-phase: the same `N` as solar only;
- three-phase: `Nh = max(13, N)`.

This means every proposal is at least eight panels, three-phase hybrid/battery proposals are at least 13 panels, single-phase proposals are capped at 15 panels, and three-phase proposals are capped at 47 panels.

## 8. Solar generation and energy allocation

### 8.1 Monthly generation

Normally:

`G = N × 0.65 × Y`

where `G` is monthly solar generation in kWh.

Two panel counts use special spreadsheet-derived rules:

- 27 panels: `G = 16.51 × Y + 50`
- 28 panels: `G = 16.51 × Y + 90`

The displayed kWp does **not** use these special rules; it remains `N × 0.65`. The 27/28-panel exception therefore changes generation without changing displayed system-size methodology.

### 8.2 Direct daytime use

Let `Rday` be the selected daytime-use ratio.

`D = min(Rday × C, G)`

This assumes the selected monthly daytime consumption can directly absorb solar generation up to that amount. No hourly load or generation profile is modeled.

### 8.3 Battery-stored energy

Solar-only and hybrid-ready proposals use:

`S = 0`

The battery proposal uses:

- if `D ≥ G`, then `S = 0`;
- otherwise `S = min(388.8, G − D)`.

The storage calculation is capped by the assumed monthly battery throughput, but it is not separately capped by the household’s remaining nighttime consumption before the bill function is called.

### 8.4 Export and import

`X = max(0, G − D − S)`

`Iraw = C − D − S`

where:

- `X` = exported solar energy in kWh;
- `Iraw` = calculated grid import in kWh.

The bill function then changes negative import to zero:

`I = max(0, Iraw)`

## 9. Post-solar bill

Let:

- `I` = non-negative grid import in kWh;
- `X` = exported energy in kWh;
- `E = min(X, I)` = export quantity eligible for the code’s credit calculation;
- `EEI(I)` = the rate from section 6;
- `T[floor(I)]` = embedded bill-table value for integer import kWh.

### 9.1 Base bill

For `I ≤ 1,001`:

`Base = T[floor(I)] + E × EEI(I)`

For `1,001 < I < 1,501`:

`Base = 476.92 + (I − 1,001) × 0.4443 × 1.096`

For `I = 1,501` exactly:

`Base = 880.10`

For `I > 1,501`:

`Base = 880.10 + (I − 1,501) × 0.5443 × 1.096`

For imports at or below 1,001 kWh, the lookup uses `floor(I)`, so the fractional part of import is discarded for `T` but retained when selecting `EEI` and calculating credit.

### 9.2 Export credit

For `I < 1,501`:

`Credit = E × 0.2703`

For `I ≥ 1,501`:

`Credit = E × 0.3703`

Final estimated bill:

`After = max(0, Base − Credit)`

Export credit is limited to `min(export, import)`. Export beyond import produces no additional credit, and the estimated bill cannot become negative.

The addition of `E × EEI(I)` to the base bill before subtracting export credit is a key item for professional confirmation.

## 10. Monthly savings

`Monthly savings = entered bill − estimated post-solar bill`

The entered bill is used directly as the baseline. The calculator does not first reconstruct a modeled pre-solar bill from the estimated consumption, so the baseline and post-solar values are produced by different paths.

Solar-only and hybrid-ready proposals have the same generation, import, export, post-solar bill, and monthly savings whenever their panel counts are equal. The hybrid flag changes price only; it does not change energy performance.

## 11. System pricing

### 11.1 Base system-price table

All values below are RM before the calculator’s 12% cash discount. A dash means no value exists in that phase table.

| Panels | Single-phase base | Three-phase base |
|---:|---:|---:|
| 8 | 16,834 | 17,808 |
| 9 | 17,597 | 18,571 |
| 10 | 18,360 | 19,334 |
| 11 | 19,124 | 20,097 |
| 12 | 21,942 | 21,364 |
| 13 | 24,022 | 22,247 |
| 14 | 24,786 | 23,010 |
| 15 | 25,549 | 23,774 |
| 16 | 27,626 | 25,851 |
| 17 | 28,390 | 26,614 |
| 18 | 29,153 | 27,378 |
| 19 | 29,916 | 28,620 |
| 20 | 30,679 | 29,383 |
| 21 | 31,442 | 30,146 |
| 22 | 32,666 | 31,370 |
| 23 | 33,430 | 32,133 |
| 24 | 35,271 | 33,136 |
| 25 | 36,034 | 33,899 |
| 26 | 36,797 | 34,663 |
| 27 | 37,530 | 35,395 |
| 28 | 40,928 | 36,158 |
| 29 | 42,920 | 38,150 |
| 30 | 43,683 | 38,913 |
| 31 | 44,446 | 39,753 |
| 32 | — | 41,161 |
| 33 | — | 41,925 |
| 34 | — | 42,780 |
| 35 | — | 45,678 |
| 36 | — | 47,977 |
| 37 | — | 49,200 |
| 38 | — | 49,964 |
| 39 | — | 50,727 |
| 40 | — | 51,490 |
| 41 | — | 53,789 |
| 42 | — | 54,552 |
| 43 | — | 55,315 |
| 44 | — | 56,079 |
| 45 | — | 56,919 |
| 46 | — | 57,682 |
| 47 | — | 59,762 |
| 48 | — | 60,526 |
| 49 | — | 61,289 |
| 50 | — | 62,052 |
| 51 | — | 62,815 |
| 52 | — | 63,579 |
| 53 | — | 64,342 |
| 54 | — | 65,105 |
| 55 | — | 65,868 |

Current sizing caps mean single-phase entries above 15 panels and three-phase entries above 47 panels are not selected by the website.

### 11.2 Hybrid-inverter addition

The code stores each addition as a charge plus a negative promotion. The net additions are:

| Phase | Panel range | Charge | Promotion | Net addition |
|---|---:|---:|---:|---:|
| Single | ≤12 | 2,500 | −400 | 2,100 |
| Single | 13–15 | 2,900 | −400 | 2,500 |
| Single | ≥16 | 3,600 | −400 | 3,200 |
| Three | ≤15 | 6,100 | −1,000 | 5,100 |
| Three | 16–18 | 6,300 | −1,000 | 5,300 |
| Three | 19–23 | 6,400 | −1,000 | 5,400 |
| Three | 24–34 | 6,500 | −1,000 | 5,500 |
| Three | ≥35 | 9,300 | −2,000 | 7,300 |

### 11.3 Final price formula

Let:

- `Pbase` = phase/panel base price;
- `M` = monthly savings;
- `H` = applicable net hybrid-inverter addition, or zero;
- `Bat` = RM8,000 for the battery proposal, or zero.

All three proposals first apply a 12% cash discount and then deduct two months of calculated savings:

`Price = Pbase × (1 − 0.12) − 2 × M + H + Bat`

Therefore, the quoted system price changes with the user’s calculated savings even when the hardware configuration is unchanged. The purpose and validity of the `−2 × M` adjustment require confirmation.

## 12. Simple payback

For positive monthly savings:

`Simple payback in years = Price / (Monthly savings × 12)`

If monthly savings are zero or negative, payback is returned as unavailable.

The calculation is a simple undiscounted payback. It does not include financing costs, energy-price escalation, panel degradation, inverter or battery replacement, maintenance, insurance, downtime, residual value, tax treatment, or the time value of money.

## 13. Display rounding

Calculations retain JavaScript floating-point values internally. The interface then formats results as follows:

| Value | Display rule |
|---|---|
| Bill, saving, post-solar bill | Rounded to the nearest whole RM |
| Panel count | Whole number |
| System size | One decimal place |
| Payback | One decimal place |
| Daytime share | Whole percentage |

Number-counting animations are visual only and do not change the calculated target values.

## 14. Worked example — website defaults

Inputs:

- Bill: RM400/month
- Supply: not sure → always resolves to three-phase
- Daytime share: 30%
- Location: Johor Bahru
- Yield: 96 kWh/kWp/month

Sizing and generation:

- Estimated consumption: 861 kWh/month
- Raw panel count: `floor(861 / 96 / 0.65) = 13`
- Panel count: 13
- Displayed system size: `13 × 0.65 = 8.45 kWp`
- Monthly generation: `13 × 0.65 × 96 = 811.2 kWh`
- Direct daytime use: `min(0.30 × 861, 811.2) = 258.3 kWh`

Energy allocation:

| Proposal | Stored (kWh) | Exported (kWh) | Grid import before bill floor (kWh) |
|---|---:|---:|---:|
| Solar only | 0.0 | 552.9 | 602.7 |
| Hybrid ready | 0.0 | 552.9 | 602.7 |
| Solar + battery | 388.8 | 164.1 | 213.9 |

Raw calculated outputs:

| Proposal | Bill after | Monthly saving | Estimated price | Payback |
|---|---:|---:|---:|---:|
| Solar only | RM128.9134 | RM271.0866 | RM19,035.1869 | 5.8515 years |
| Hybrid ready | RM128.9134 | RM271.0866 | RM24,135.1869 | 7.4193 years |
| Solar + battery | RM38.2992 | RM361.7008 | RM31,953.9583 | 7.3620 years |

Primary website display after rounding:

- **RM362/month estimated savings**
- **RM38 estimated new bill**
- **13 panels**
- **8.4 kWp** as produced by JavaScript one-decimal formatting of the stored floating-point value
- **7.4 years simple payback**

## 15. Regression reference cases

These values were generated directly from the V3 calculation engine and can be used to detect unintended code changes.

| Case | Inputs | Consumption | Primary battery result: panels / kWp | Bill after | Saving | Price | Payback |
|---|---|---:|---:|---:|---:|---:|---:|
| Default | RM400, auto, 30%, JB | 861.0000 | 13 / 8.45 | 38.2992 | 361.7008 | 31,953.9583 | 7.3620 |
| Lower bill / mostly out | RM300, single, 15%, JB | 704.0000 | 11 / 7.15 | 36.7961 | 263.2039 | 26,402.7122 | 8.3594 |
| Higher yield / mostly home | RM700, three, 50%, Melaka | 1,457.7712 | 21 / 13.65 | 60.6734 | 639.3266 | 38,649.8269 | 5.0378 |
| Interface maximum | RM3,000, auto, 30%, JB | 5,049.0986 | 47 / 30.55 | 1,480.0334 | 1,519.9666 | 64,850.6268 | 3.5555 |

## 16. Professional validation checklist

| Review item | Why confirmation is needed | Status / professional note |
|---|---|---|
| Tariff lookup table and effective date | The source is embedded and contains boundary jumps. Confirm all components, taxes, incentives, and minimum charges. | Pending |
| Bill-to-kWh reverse formulas | Confirm constants 1.016, 100/108, 266.58, 326.58, 0.4443, and 0.5443. | Pending |
| RM721–RM880 conversion | Every bill in this interval maps to exactly 1,501 kWh. | Pending |
| `EEI` treatment | The code adds `eligible export × EEI(import)` before subtracting export credit. | Pending |
| Export rates and cap | Confirm RM0.2703/RM0.3703 per kWh and the cap at `min(export, import)`. | Pending |
| Default phase assumption | “Not sure” always uses the three-phase calculation. Confirm this remains the intended default. | Sales clarification applied |
| Solar-yield values | Confirm each town’s monthly yield, roof-angle scope, losses, shading, and seasonal treatment. | Pending |
| Panel sizing limits | Confirm minimum eight panels, three-phase hybrid minimum 13, and caps of 23/47. | Pending |
| 27/28-panel generation exceptions | These use 16.51 kWp plus fixed 50/90 kWh adjustments while displayed kWp remains panel count × 0.65. | Pending |
| Daytime self-consumption model | A monthly ratio replaces an hourly load/generation model. | Pending |
| Battery model | Confirm 16 kWh, two 90% factors, 30 days, 388.8 kWh/month, and treatment of remaining night demand. | Pending |
| System-price tables | Confirm all phase/panel prices and their tax/inclusion basis. | Pending |
| Promotions and discount | Confirm the 12% cash discount, hybrid promotions, and RM2,800 battery promotion. | Pending |
| `−2 × monthly savings` price adjustment | This makes hardware price depend on estimated savings. Confirm its commercial meaning. | Pending |
| Recommendation rule | The battery proposal is always labelled recommended; no comparative ranking is performed. | Pending |
| Payback scope | Confirm whether simple payback is sufficient or whether lifecycle cash flow is required. | Pending |
| Result disclaimer | Confirm that “illustrative estimate” and site-assessment wording meet legal/commercial requirements. | Pending |

## 17. Items not modeled

The current website does not explicitly model:

- roof area, orientation, azimuth, shading, or structural suitability;
- hourly or seasonal load and generation profiles;
- weather variability or year-to-year solar resource changes;
- panel soiling, mismatch, availability, clipping, or long-term degradation;
- inverter efficiency outside the special yield assumptions;
- battery state of charge, reserve setting, power limit, degradation, cycling strategy, or replacement;
- grid outages in the energy or financial calculation;
- export beyond the amount of grid import;
- future tariff or policy changes;
- financing, inflation, escalation, maintenance, insurance, tax, or time value of money.

These omissions are consistent with an illustrative booth calculator, but professionals should decide which must be added or disclosed before external use.
