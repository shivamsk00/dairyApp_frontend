/**
 * The low SNF rule, used to fill the cells a scanned price list leaves empty (every FAT row, 2.5 to 10.0).
 *
 * Below SNF 8.5 an empty cell is a percent of the same row's 8.5 price, 2% less for every 0.1 SNF lower:
 *   8.4 98% · 8.3 96% · 8.2 94% · 8.1 92% · 8.0 90% · 7.9 88% · 7.8 86% · 7.7 84% · 7.6 82% · 7.5 80%
 * A price the list prints is always used as printed.
 *
 * `chartRate(snf)` gives the printed price for this FAT at that SNF, or null when there is none.
 */
const round1 = (n) => Math.round(parseFloat(n) * 10) / 10
// percent of a price, worked in whole paise so x.xx5 always rounds up (20.15 x 90% = 18.14, not 18.13)
const percentOf = (price, percent) => Math.round((Math.round(price * 100) * percent) / 100) / 100

/** 8.4 -> 98, 8.0 -> 90, 7.5 -> 80 (percent of the 8.5 price) */
export const lowSnfPercent = (snf) => 100 - 2 * (85 - Math.round(snf * 10))

/** @returns {{accepted: boolean, rate: number|null, percent?: number, rule?: string}} */
export function resolveLowSnfRate(fat, snf, chartRate) {
  const s = round1(snf)
  const listRate = chartRate(s)
  if (listRate !== null && listRate !== undefined) return { accepted: true, rate: listRate }
  if (s >= 8.5) return { accepted: true, rate: null } // a printed column that could not be read

  const base = chartRate(8.5)
  if (base === null || base === undefined) return { accepted: true, rate: null }
  const percent = lowSnfPercent(s)
  return { accepted: true, rate: percentOf(base, percent), percent, rule: 'low-snf' }
}
