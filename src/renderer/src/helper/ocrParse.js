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
      const hasLabel = label !== null && label >= 2.5 && label <= 10
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
 * Rows for the "check the scanned prices" preview, from the first SNF column the chart shows up to the last
 * printed one. A price the list prints is used as read; every cell the list leaves empty is worked out (see
 * recalcPreviewRows). FAT rows above the first scanned one (down to firstFat) are added and worked out too.
 *
 * Each row: { fat, cells, flags, kinds, stepped? }. A cell is a string, '' (a price to type in) or null
 * (nothing to enter). A flag is 'check' (please check or fill in), 'rule' (worked out) or false.
 * A kind is 'read' (scanned or typed by the user), 'rule' (low SNF rule) or 'step' (stepped down from the
 * first two scanned rows).
 *
 * @param {{snfColumns:number[], rows:{fat:number,cells:(string|null)[]}[], flagged:Set<string>, missing:number[]}} result
 */
export function buildPreviewRows(result, firstSnf = 8.1, firstFat = null) {
  const last = result.snfColumns[result.snfColumns.length - 1]
  const columns = []
  for (let t = Math.round(firstSnf * 10); t <= Math.round(last * 10); t++) columns.push(t / 10)
  const printedAt = new Map(result.snfColumns.map((snf, j) => [snf, j]))

  const rowFor = (scanned) => {
    const row = { fat: scanned.fat, cells: [], flags: [], kinds: [] }
    for (const snf of columns) {
      const j = printedAt.get(snf)
      const value = j === undefined ? null : scanned.cells[j]
      if (value === null) {
        row.cells.push('') // the list prints nothing here: worked out below
        row.flags.push(false)
        row.kinds.push('rule')
      } else {
        row.cells.push(value === UNREADABLE ? '' : value)
        row.flags.push(value === UNREADABLE || result.flagged.has(`${scanned.fat}|${j}`) ? 'check' : false)
        row.kinds.push('read')
      }
    }
    return row
  }

  const rows = result.rows.map(rowFor)
  // Rows that could not be read at all: the printed columns are typed in, the low ones then follow the rule.
  for (const fat of result.missing) {
    rows.push({
      fat,
      cells: columns.map(() => ''),
      flags: columns.map(() => 'check'),
      kinds: columns.map((snf) => (snf < 8.5 ? 'rule' : 'read'))
    })
  }
  rows.sort((a, b) => a.fat - b.fat)

  if (firstFat !== null) {
    const [first, second] = rows
    const extra = []
    for (let f = firstFat; f < first.fat - 0.05; f = round1(f + 0.1)) {
      extra.push({
        fat: f,
        stepped: true,
        cells: columns.map(() => ''),
        flags: columns.map(() => false),
        // a printed column steps down; a column the rule fills is worked out from the stepped prices
        kinds: columns.map((_, j) => (first.kinds[j] === 'read' && second?.kinds[j] === 'read' ? 'step' : 'rule'))
      })
    }
    rows.unshift(...extra)
  }
  return { snfColumns: columns, rows: recalcPreviewRows(rows, columns) }
}

const toPaise = (c) => (c === null || c === '' || c === UNREADABLE || isNaN(Number(c)) ? null : Math.round(parseFloat(c) * 100))

/**
 * Works out every 'step' and 'rule' cell again from the current 'read' prices, so fixing a price in the
 * preview also fixes every price worked out from it. All sums are in whole paise.
 *   - 'step' (FAT rows above the first scanned row): first row price - n x (second row price - first row price),
 *     n = number of 0.1 FAT steps above the first scanned row.
 *   - 'rule': resolveLowSnfRate, a percent of the same row's 8.5 price (8.4 98%, 8.3 96% ... 8.0 90% ... 7.5 80%),
 *     using only a read or stepped 8.5 price.
 * A worked-out price whose source is marked 'check' is marked 'check' too.
 */
export function recalcPreviewRows(rows, columns) {
  const out = rows.map((r) => ({ ...r, cells: [...r.cells], flags: [...r.flags] }))
  const colOf = new Map(columns.map((snf, j) => [Math.round(snf * 10), j]))

  const [first, second] = out.filter((r) => !r.stepped)
  for (const row of out) {
    if (!row.stepped) continue
    const n = Math.round((first.fat - row.fat) * 10)
    row.kinds.forEach((kind, j) => {
      if (kind !== 'step') return
      const a = toPaise(first.cells[j])
      const b = second ? toPaise(second.cells[j]) : null
      if (a === null || b === null) {
        row.cells[j] = ''
        row.flags[j] = 'check'
        return
      }
      row.cells[j] = (Math.max(0, a - n * (b - a)) / 100).toFixed(2)
      row.flags[j] = first.flags[j] === 'check' || second.flags[j] === 'check' ? 'check' : 'rule'
    })
  }

  for (const row of out) {
    const chartRate = (snf) => {
      const j = colOf.get(Math.round(snf * 10))
      if (j === undefined || row.kinds[j] === 'rule') return null
      const p = toPaise(row.cells[j])
      return p === null ? null : p / 100
    }
    row.kinds.forEach((kind, j) => {
      if (kind !== 'rule') return
      const snf = columns[j]
      const res = resolveLowSnfRate(row.fat, snf, chartRate)
      if (!res.accepted) {
        row.cells[j] = null
        row.flags[j] = false
      } else if (res.rate === null) {
        row.cells[j] = ''
        row.flags[j] = 'check' // the price it is worked out from is missing
      } else {
        row.cells[j] = res.rate.toFixed(2)
        const base = res.percent ? colOf.get(85) : undefined
        row.flags[j] = base !== undefined && row.flags[base] === 'check' ? 'check' : 'rule'
      }
    })
  }
  return out
}
