/**
 * Reads a picture of a price list into rate-chart rows.
 *
 * Preparing the picture happens here (a plain canvas, nothing to download): enlarge it so the small digits
 * are readable, make it grey with full contrast, find each printed text line, and cut it into blocks of a
 * few lines. The blocks go to the main process, which reads them offline (see src/main/ocr.js).
 */
import { interpretRateText } from './ocrParse'

const TARGET_WIDTH = 2900 // wide enough for small print, small enough to stay quick
const MAX_PIXELS = 14_000_000
const LINES_PER_BLOCK = 4

async function loadBitmap(file) {
  return createImageBitmap(file)
}

/** Enlarge + grey + stretch contrast. Returns the canvas and the grey values. */
function prepare(bitmap) {
  let scale = Math.min(4, Math.max(1, TARGET_WIDTH / bitmap.width))
  while (bitmap.width * scale * bitmap.height * scale > MAX_PIXELS && scale > 1) scale -= 0.25
  const W = Math.round(bitmap.width * scale)
  const H = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, W, H)

  const image = ctx.getImageData(0, 0, W, H)
  const px = image.data
  const gray = new Uint8Array(W * H)
  const histogram = new Uint32Array(256)
  for (let i = 0, g = 0; i < px.length; i += 4, g++) {
    const v = (px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114) / 1000
    gray[g] = v
    histogram[gray[g]]++
  }
  // Stretch contrast between the 1st and 99th percentile.
  const total = W * H
  let lo = 0
  let hi = 255
  for (let acc = 0; lo < 255; lo++) if ((acc += histogram[lo]) > total * 0.01) break
  for (let acc = 0; hi > 0; hi--) if ((acc += histogram[hi]) > total * 0.01) break
  const span = Math.max(1, hi - lo)
  for (let i = 0; i < gray.length; i++) gray[i] = Math.max(0, Math.min(255, ((gray[i] - lo) * 255) / span))
  for (let i = 0, g = 0; i < px.length; i += 4, g++) px[i] = px[i + 1] = px[i + 2] = gray[g]
  ctx.putImageData(image, 0, 0)
  return { canvas, gray, W, H, scale }
}

/** Rows of the picture that hold text: some ink, but not a full-width table rule. */
function findTextLines(gray, W, H, scale) {
  const minHeight = Math.max(6, Math.round((10 * scale) / 3))
  const x0 = Math.round(W * 0.03)
  const x1 = Math.round(W * 0.97)
  const lines = []
  let start = null
  for (let y = 0; y <= H; y++) {
    let isText = false
    if (y < H) {
      let dark = 0
      const base = y * W
      for (let x = x0; x < x1; x++) if (gray[base + x] < 150) dark++
      const ink = dark / (x1 - x0)
      isText = ink > 0.07 && ink < 0.55
    }
    if (isText && start === null) start = y
    if (!isText && start !== null) {
      if (y - start >= minHeight) lines.push([start, y])
      start = null
    }
  }
  return lines
}

const canvasToBytes = (canvas) =>
  new Promise((resolve, reject) =>
    canvas.toBlob(
      async (blob) => (blob ? resolve(new Uint8Array(await blob.arrayBuffer())) : reject(new Error('Could not prepare the picture.'))),
      'image/png'
    )
  )

/**
 * @param {File} file the picture
 * @param {{x:number,y:number,w:number,h:number}} [crop] part of the picture to read, as shares of its size (0 to 1)
 * @param {(stage: {step: 'prepare'|'read'|'check', done?: number, total?: number}) => void} onStage
 * @returns {Promise<{error?: string, snfColumns?: number[], rows?: object[], flagged?: Set<string>, missing?: number[]}>}
 */
export async function scanRateImage(file, onStage = () => {}, crop = null) {
  if (!window.api?.ocrRecognize) return { error: 'Scanning is only available in the installed desktop app.' }

  onStage({ step: 'prepare' })
  let bitmap = await loadBitmap(file)
  if (crop && (crop.w < 0.999 || crop.h < 0.999)) {
    const sx = Math.round(crop.x * bitmap.width)
    const sy = Math.round(crop.y * bitmap.height)
    const sw = Math.max(1, Math.min(bitmap.width - sx, Math.round(crop.w * bitmap.width)))
    const sh = Math.max(1, Math.min(bitmap.height - sy, Math.round(crop.h * bitmap.height)))
    const whole = bitmap
    bitmap = await createImageBitmap(whole, sx, sy, sw, sh)
    whole.close?.()
  }
  const { canvas, gray, W, H, scale } = prepare(bitmap)
  bitmap.close?.()
  const lines = findTextLines(gray, W, H, scale)
  if (lines.length < 8) return { error: 'No table was found in this picture. Try a clearer, larger picture of the price list.' }

  const chunks = []
  for (let i = 0; i < lines.length; i += LINES_PER_BLOCK) {
    const block = lines.slice(i, i + LINES_PER_BLOCK)
    const top = Math.max(0, block[0][0] - 8)
    const bottom = Math.min(H, block[block.length - 1][1] + 8)
    const part = document.createElement('canvas')
    part.width = W
    part.height = bottom - top
    part.getContext('2d').drawImage(canvas, 0, top, W, bottom - top, 0, 0, W, bottom - top)
    chunks.push(await canvasToBytes(part))
  }

  onStage({ step: 'read', done: 0, total: chunks.length })
  const stopListening = window.api.onOcrProgress?.((p) => onStage({ step: 'read', ...p }))
  let answer
  try {
    answer = await window.api.ocrRecognize(chunks)
  } finally {
    stopListening?.()
  }
  if (!answer?.success) return { error: answer?.message || 'The picture could not be read.' }

  onStage({ step: 'check' })
  return interpretRateText(answer.texts)
}
