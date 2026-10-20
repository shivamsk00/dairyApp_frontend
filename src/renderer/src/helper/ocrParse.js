/**
 * Turns the text read from a price-list picture into rows of rates. Pure functions, no screen code, so
 * the same logic is easy to test.
 *
 * A printed list has FAT down the side (3.2, 3.3 ... going up by 0.1) and SNF across the top. Because FAT
 * rises by exactly 0.1 on every row, a row whose label was not read is still placed correctly by its
 * position, and any label that WAS read re-anchors the position after a lost row.
 */

import { resolveLowSnfRate } from './lowSnfRule'

const round1 = (n) => Math.round(n * 10) / 10

/** Marks a price that was there but could not be read. It keeps its place so the others do not shift. */
export const UNREADABLE = '?'

/** One OCR token -> 0..n price strings ("36.63"), repairing the usual reading slips. */
export function priceTokens(token) {
  const t = token.replace(/,/g, '.').replace(/\.{2,}/g, '.')
  if (/^\d{2}\.\d{2}$/.test(t)) return [t]
  if (/^(\d{2}\.\d{2}){2,}$/.test(t)) return t.match(/\d{2}\.\d{2}/g) // two prices glued together
  if (/^\d{4}$/.test(t)) return [`${t.slice(0, 2)}.${t.slice(2)}`] // the dot was lost
  // Something numeric but damaged (cut off, extra digit): a price was here, keep its slot.
  if (/^\d[\d.]{2,}$/.test(t)) return [UNREADABLE]
  return [] // stray specks such as "1" or "."
}

/** A FAT / SNF number as printed, tolerating a lost dot: "8.3", "83" -> 8.3, "100" -> 10.0. */
export function smallNumber(token) {
  const t = token.replace(',', '.')
  if (/^\d{1,2}\.\d$/.test(t)) return round1(parseFloat(t))
  if (/^\d{2}$/.test(t)) return round1(parseFloat(`${t[0]}.${t[1]}`))
  if (t === '100') return 10
  return null
}

const splitLine = (raw) => raw.trim().split(/\s+/).filter(Boolean)

/** Lines that look like a data row: (optional FAT label) + at least 3 prices. */
export function readPriceLines(texts) {
  const out = []
  for (const text of texts) {
    for (const raw of text.split('\n')) {
      const parts = splitLine(raw)
      if (!parts.length) continue
      const label = smallNumber(parts[0])
      const hasLabel = label !== null && label >= 3 && label <= 10
      const prices = (hasLabel ? parts.slice(1) : parts).flatMap(priceTokens)
      if (prices.filter((p) => p !== UNREADABLE).length < 3) continue // headings, notes, empty lines
      out.push({ label: hasLabel ? label : null, prices })
    }
  }
  return out
}

/** The SNF header, e.g. "SNF 8.3 8.4 8.5 ... 9.0" -> [8.3, 8.4, ... 9.0]. Longest run that rises by 0.1. */
export function detectSnfColumns(texts) {
  let best = []
  for (const text of texts) {
    for (const raw of text.split('\n')) {
      const nums = splitLine(raw)
        .map(smallNumber)
        .filter((n) => n !== null && n >= 6 && n <= 11)
      let run = []
      for (const n of nums) {
        if (run.length && Math.abs(n - run[run.length - 1] - 0.1) < 0.01) run.push(n)
        else run = [n]
        if (run.length > best.length) best = [...run]
      }
    }
  }
  return best.length >= 4 ? best : []
}

/** FAT of the first row: every read label votes for (label - 0.1 x its position); the early votes win. */
export function guessStartFat(lines) {
  const votes = new Map()
  lines.slice(0, 12).forEach((line, i) => {
    if (line.label === null) return
    const start = round1(line.label - 0.1 * i)
    votes.set(start, (votes.get(start) || 0) + 1)
  })
  let best = null
  for (const [start, n] of votes) if (best === null || n > best.n) best = { start, n }
  return best ? best.start : null
}

/** Put a FAT value on every price line and align its prices to the SNF columns (blanks on the left). */
export function placeRows(lines, startFat, snfCount) {
  const rows = []
  let fat = startFat
  for (const line of lines) {
    const fits = line.label !== null && line.label >= fat - 0.05 && line.label <= fat + 0.55
    if (fits) fat = line.label // a read label re-anchors the position after a lost row
    const use = line.prices.slice(-snfCount)
    const cells = Array(snfCount).fill(null)
    use.forEach((p, k) => (cells[snfCount - use.length + k] = p))
    rows.push({ fat: round1(fat), cells, count: line.prices.length, labelRead: line.label })
    fat = round1(fat + 0.1)
  }
  return rows
}

/**
 * Cells that cannot be trusted: a row with an unusual number of prices, a price that does not rise along
 * its row, or one that does not rise down its column. Returns a Set of "fat|columnIndex".
 */
export function checkRows(rows, snfCount) {
  const flagged = new Set()
  const counts = new Map()
  rows.forEach((r) => counts.set(Math.min(r.count, snfCount + 1), (counts.get(Math.min(r.count, snfCount + 1)) || 0) + 1))
  // The two usual row lengths (e.g. 8 prices, and 6 where the first two columns are blank).
  const usual = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c)
  const byFat = new Map(rows.map((r) => [r.fat, r]))

  for (const row of rows) {
    const unusual = !usual.includes(Math.min(row.count, snfCount + 1)) || row.count > snfCount
    let previous = null
    row.cells.forEach((cell, i) => {
      if (cell === null) return
      if (cell === UNREADABLE) {
        flagged.add(`${row.fat}|${i}`)
        return
      }
      const value = parseFloat(cell)
      if (unusual) flagged.add(`${row.fat}|${i}`)
      if (previous !== null && !(value > previous)) flagged.add(`${row.fat}|${i}`)
      else previous = value
      const above = byFat.get(round1(row.fat - 0.1))
      if (above && above.cells[i] !== null && above.cells[i] !== UNREADABLE && !(value > parseFloat(above.cells[i]))) flagged.add(`${row.fat}|${i}`)
    })
  }
  return flagged
}

/** FAT values that should exist between the first and last row but were not read. */
export function missingFats(rows) {
  if (!rows.length) return []
  const have = new Set(rows.map((r) => r.fat))
  const lo = Math.min(...have)
  const hi = Math.max(...have)
  const out = []
  for (let f = lo; f <= hi + 0.001; f = round1(f + 0.1)) if (!have.has(round1(f))) out.push(round1(f))
  return out
}

/** All of it: text of each block -> { snfColumns, rows, flagged, missing, startFat } (or an error message). */
export function interpretRateText(texts) {
  const snfColumns = detectSnfColumns(texts)
  if (!snfColumns.length) {
    return { error: 'The SNF header row (for example 8.3 8.4 8.5 …) could not be found. Use a picture that includes the top of the table.' }
  }
  const lines = readPriceLines(texts)
  if (lines.length < 5) return { error: 'No table of prices was found in this picture.' }
  const startFat = guessStartFat(lines)
  if (startFat === null) {
    return { error: 'The FAT numbers on the left could not be read. Use a sharper or larger picture.' }
  }
  const rows = placeRows(lines, startFat, snfColumns.length)
  return { snfColumns, rows, flagged: checkRows(rows, snfColumns.length), missing: missingFats(rows), startFat }
}

/**
 * Rows for the "check the scanned prices" preview, from the first SNF column the chart shows (8.1) up to
 * the last printed one. A price the list prints is used as read. The columns the list leaves out are worked
 * out with rule 3 (see lowSnfRule.js); where milk is not accepted the cell is blank.
 *
 * Each cell is a string, '' (a price to type in) or null (nothing to enter here).
 * Each flag is 'check' (please check or fill in), 'rule' (worked out by rule 3) or false.
 *
 * @param {{snfColumns:number[], rows:{fat:number,cells:(string|null)[]}[], flagged:Set<string>, missing:number[]}} result
 */
export function buildPreviewRows(result, firstSnf = 8.1) {
  const last = result.snfColumns[result.snfColumns.length - 1]
  const columns = []
  for (let t = Math.round(firstSnf * 10); t <= Math.round(last * 10); t++) columns.push(t / 10)
  const printedAt = new Map(result.snfColumns.map((snf, j) => [snf, j]))

  const rowFor = (scanned) => {
    const read = (snf) => {
      const j = printedAt.get(snf)
      if (j === undefined) return { kind: 'absent' }
      const value = scanned.cells[j]
      if (value === null) return { kind: 'blank' }
      if (value === UNREADABLE) return { kind: 'unreadable' }
      return { kind: 'value', value, flagged: result.flagged.has(`${scanned.fat}|${j}`) }
    }
    // printed price (as a number) or null, for the rule
    const printedNumber = (snf) => {
      const r = read(snf)
      return r.kind === 'value' ? parseFloat(r.value) : null
    }
    const cells = []
    const flags = []
    for (const snf of columns) {
      const r = read(snf)
      if (r.kind === 'value') {
        cells.push(r.value)
        flags.push(r.flagged ? 'check' : false)
      } else if (r.kind === 'unreadable') {
        cells.push('')
        flags.push('check')
      } else {
        // the list prints nothing here: rule 3 decides
        const res = resolveLowSnfRate(scanned.fat, snf, printedNumber)
        if (!res.accepted) {
          cells.push(null)
          flags.push(false)
        } else if (res.rate !== null) {
          cells.push(res.rate.toFixed(2))
          flags.push('rule')
        } else {
          cells.push('')
          flags.push('check') // the price it is worked out from could not be read
        }
      }
    }
    return { fat: scanned.fat, cells, flags }
  }

  const rows = result.rows.map(rowFor)
  // Rows that could not be read at all are added empty, so they can be typed in.
  for (const fat of result.missing) {
    rows.push({ fat, cells: columns.map(() => ''), flags: columns.map(() => 'check') })
  }
  rows.sort((a, b) => a.fat - b.fat)
  return { snfColumns: columns, rows }
}
