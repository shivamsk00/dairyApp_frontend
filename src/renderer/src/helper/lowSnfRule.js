/**
 * Rule 3 of the price list, for milk with LOW SNF. The same rule the server applies when a milk rate is
 * looked up (dairyBackend/src/utils/rateRules.js), here used to fill the columns the printed list leaves
 * out when a price list is scanned.
 *
 *   - SNF 8.2 / 8.1 / 8.0  : 94% / 92% / 90% of the 8.5% SNF rate (FAT up to 5.0).
 *   - FAT 5.1 to 10.0      : milk below 8.3% SNF is NOT accepted.
 *   - SNF 8.4 / 8.3        : where the list has no price (FAT above 5.0), 93% / 87% of the 9.0% SNF rate.
 *   - SNF below 8.0        : Rs 500 per kg of fat.
 *
 * `chartRate(snf)` gives the printed price for this FAT at that SNF, or null when there is none.
 *
 * `fillLowColumns`: also give SNF 8.2 / 8.1 a price (94% / 92% of the 8.5% rate) on the rows above FAT 5.0,
 * where the rule says milk is not accepted, so a scanned chart has those two columns filled on every row.
 */
const round1 = (n) => Math.round(parseFloat(n) * 10) / 10
const round2 = (n) => Math.round(n * 100) / 100

const LOW_SNF_PERCENT = { 8.2: 94, 8.1: 92, 8.0: 90 } // of the 8.5% SNF rate
const EDGE_SNF_PERCENT = { 8.4: 93, 8.3: 87 } // of the 9.0% SNF rate
const FAT_KG_RATE = 500
const NO_LOW_SNF_ABOVE_FAT = 5.0

/** @returns {{accepted: boolean, rate: number|null, percent?: number, rule?: string}} */
export function resolveLowSnfRate(fat, snf, chartRate, { fillLowColumns = false } = {}) {
  const f = round1(fat)
  const s = round1(snf)
  const listRate = chartRate(s)

  if (s >= 8.5 || (s >= 8.3 && listRate !== null && listRate !== undefined)) {
    return { accepted: true, rate: listRate ?? null }
  }
  if (s < 8.3 && f > NO_LOW_SNF_ABOVE_FAT && !(fillLowColumns && s >= 8.1)) return { accepted: false, rate: null }

  if (s === 8.4 || s === 8.3) {
    const base = chartRate(9.0)
    if (base === null || base === undefined) return { accepted: true, rate: null }
    const percent = EDGE_SNF_PERCENT[s]
    return { accepted: true, rate: round2((base * percent) / 100), percent, rule: 'low-snf' }
  }
  if (s in LOW_SNF_PERCENT) {
    const base = chartRate(8.5)
    if (base === null || base === undefined) return { accepted: true, rate: null }
    const percent = LOW_SNF_PERCENT[s]
    return { accepted: true, rate: round2((base * percent) / 100), percent, rule: 'low-snf' }
  }
  if (s < 8.0) return { accepted: true, rate: round2((FAT_KG_RATE * f) / 100), rule: 'fat-kg' }
  return { accepted: true, rate: listRate ?? null }
}
