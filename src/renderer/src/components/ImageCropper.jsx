/* eslint-disable react/prop-types -- props are documented below */
import { useCallback, useEffect, useRef, useState } from 'react'

const MIN = 0.04 // smallest crop side, as a share of the picture
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
const CURSOR = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize' }
const POSITION = {
  nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2',
  n: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2',
  ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2',
  e: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
  se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2',
  s: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2',
  sw: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2',
  w: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
export const FULL_CROP = { x: 0, y: 0, w: 1, h: 1 }

/**
 * Picture preview with a crop box. Drag inside the box to move it, drag a handle to resize it, or drag on
 * the picture outside the box to draw a new one. Sizes are shares of the picture (0 to 1), so they do not
 * depend on how big the preview is on screen.
 *
 * @param {string} src picture address
 * @param {{x:number,y:number,w:number,h:number}} crop current box
 * @param {(crop) => void} onChange
 * @param {(size: {width:number,height:number}) => void} [onLoad] natural size of the picture
 * @param {'fit'|number} [zoom] 'fit' shows the whole picture within the available space; a number shows it
 *   at that share of its real size (1 = 100%) inside a scrolling area, for reading small print.
 * @param {number} [naturalWidth] real width of the picture in pixels (needed for numeric zoom)
 */
const ImageCropper = ({ src, crop, onChange, onLoad, zoom = 'fit', naturalWidth = 0 }) => {
  const frameRef = useRef(null)
  const dragRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const point = useCallback((event) => {
    const box = frameRef.current.getBoundingClientRect()
    return {
      x: clamp((event.clientX - box.left) / box.width, 0, 1),
      y: clamp((event.clientY - box.top) / box.height, 0, 1)
    }
  }, [])

  // Every change goes through here, so the end of a drag knows the latest box even before React re-renders.
  const emit = (rect) => {
    if (dragRef.current) dragRef.current.latest = rect
    onChange(rect)
  }

  const start = (mode) => (event) => {
    event.preventDefault()
    event.stopPropagation()
    frameRef.current.setPointerCapture?.(event.pointerId)
    const p = point(event)
    dragRef.current = { mode, from: p, original: crop, latest: crop }
    if (mode === 'draw') emit({ x: p.x, y: p.y, w: 0, h: 0 })
    setDragging(true)
  }

  const move = (event) => {
    const drag = dragRef.current
    if (!drag) return
    const p = point(event)
    const o = drag.original
    if (drag.mode === 'move') {
      emit({
        ...o,
        x: clamp(o.x + p.x - drag.from.x, 0, 1 - o.w),
        y: clamp(o.y + p.y - drag.from.y, 0, 1 - o.h)
      })
    } else if (drag.mode === 'draw') {
      const x1 = Math.min(drag.from.x, p.x)
      const y1 = Math.min(drag.from.y, p.y)
      emit({ x: x1, y: y1, w: Math.abs(p.x - drag.from.x), h: Math.abs(p.y - drag.from.y) })
    } else {
      // resizing: move the edges this handle touches
      let left = o.x
      let top = o.y
      let right = o.x + o.w
      let bottom = o.y + o.h
      if (drag.mode.includes('w')) left = clamp(p.x, 0, right - MIN)
      if (drag.mode.includes('e')) right = clamp(p.x, left + MIN, 1)
      if (drag.mode.includes('n')) top = clamp(p.y, 0, bottom - MIN)
      if (drag.mode.includes('s')) bottom = clamp(p.y, top + MIN, 1)
      emit({ x: left, y: top, w: right - left, h: bottom - top })
    }
  }

  const end = () => {
    if (!dragRef.current) return
    // A click without dragging, or a tiny box, goes back to the whole picture.
    const latest = dragRef.current.latest
    if (dragRef.current.mode === 'draw' && (latest.w < MIN || latest.h < MIN)) onChange(FULL_CROP)
    dragRef.current = null
    setDragging(false)
  }

  useEffect(() => () => (dragRef.current = null), [])

  const fit = zoom === 'fit' || !naturalWidth
  return (
    // The area is as tall as the window allows; a zoomed picture scrolls inside it.
    <div
      className="ui-scroll-thin max-h-[calc(100vh-21rem)] min-h-[14rem] overflow-auto rounded-lg bg-[color:var(--ui-neutral-100)] p-2"
      style={{ textAlign: 'center' }}
    >
      <div
        ref={frameRef}
        onPointerDown={start('draw')}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        className="relative inline-block touch-none select-none overflow-hidden rounded-md shadow-md"
        style={{ cursor: dragging ? 'grabbing' : 'crosshair', ...(fit ? { maxWidth: '100%' } : { width: naturalWidth * zoom }) }}
      >
        <img
          src={src}
          alt="Picture to scan"
          draggable={false}
          onLoad={(e) => onLoad?.({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })}
          className={fit ? 'block max-h-[calc(100vh-23rem)] max-w-full' : 'block h-auto w-full max-w-none'}
        />
        <div
          onPointerDown={start('move')}
          className="absolute border-2 border-dashed border-white"
          style={{
            left: `${crop.x * 100}%`,
            top: `${crop.y * 100}%`,
            width: `${crop.w * 100}%`,
            height: `${crop.h * 100}%`,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
            cursor: 'move'
          }}
        >
          {HANDLES.map((h) => (
            <span
              key={h}
              onPointerDown={start(h)}
              className={`absolute size-3 rounded-sm border border-[color:var(--ui-primary-600)] bg-white ${POSITION[h]}`}
              style={{ cursor: CURSOR[h] }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImageCropper
