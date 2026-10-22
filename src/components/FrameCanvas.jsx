import { useRef, useEffect, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Default scroll length (in frames) of the crossfade into a clip; override per clip with `blendIn`
const CLIP_BLEND = 12

const framePath = (dir, i) => `/${dir}/frame_${String(i + 1).padStart(4, '0')}.webp`

/**
 * Lay the clips out on one scroll timeline. Each clip spans (count - 1) units,
 * followed by a crossfade into the next clip (its `blendIn`, or CLIP_BLEND units).
 */
function buildTimeline(sequences) {
  const segments = []
  let cursor = 0
  let offset = 0
  sequences.forEach((seq, k) => {
    segments.push({ type: 'clip', start: cursor, length: seq.count - 1, offset })
    cursor += seq.count - 1
    if (k < sequences.length - 1) {
      const length = sequences[k + 1].blendIn ?? CLIP_BLEND
      segments.push({ type: 'blend', start: cursor, length, from: offset + seq.count - 1, to: offset + seq.count })
      cursor += length
    }
    offset += seq.count
  })
  return { segments, length: cursor, total: offset }
}

/** Resolve a timeline position to two flat frame indices and how much of the second to show. */
function resolve(timeline, value) {
  const seg =
    timeline.segments.find((s) => value <= s.start + s.length) ??
    timeline.segments[timeline.segments.length - 1]
  const local = Math.min(seg.length, Math.max(0, value - seg.start))
  if (seg.type === 'blend') return { a: seg.from, b: seg.to, mix: local / seg.length }
  const i = Math.floor(local)
  return { a: seg.offset + i, b: seg.offset + Math.min(i + 1, seg.length), mix: local - i }
}

/**
 * FrameCanvas — draws pre-rendered video frames on a <canvas> that fills its parent,
 * scrubbed by scroll position. Several clips play back to back with a crossfade.
 *
 * Props:
 *  - sequences: [{ dir, count, blendIn? }] — frame folders under /public, in playback order
 *  - onProgress(percent): loading progress of the first clip
 *  - onLoaded(): called once the first clip is ready (later clips keep loading)
 *  - counterRef: optional ref to an element whose text shows the current frame
 */
export default function FrameCanvas({ sequences, onProgress, onLoaded, counterRef }) {
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const frameRef = useRef({ value: 0 })
  const lastDrawnRef = useRef(-1)
  const callbacksRef = useRef({ onProgress, onLoaded })
  const timeline = useMemo(() => buildTimeline(sequences), [sequences])

  useEffect(() => {
    callbacksRef.current = { onProgress, onLoaded }
  }, [onProgress, onLoaded])

  // Draw the current position with "cover" fit. The second frame is blended in by
  // `mix`, so motion reads as continuous rather than stepped, and clips crossfade.
  const draw = useCallback(
    (force = false) => {
      const canvas = canvasRef.current
      if (!canvas || !canvas.width) return
      const value = Math.min(timeline.length, Math.max(0, frameRef.current.value))
      const step = Math.round(value * 24) // redraw granularity: 1/24 of a frame
      if (!force && step === lastDrawnRef.current) return

      const { a, b, mix } = resolve(timeline, value)
      const ready = (image) => image?.complete && image.naturalWidth
      const img = imagesRef.current[a]
      const next = imagesRef.current[b]
      // A later clip may still be loading; hold the last good picture until it arrives
      if (!ready(img)) return

      const ctx = canvas.getContext('2d')
      const paint = (image) => {
        const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
        const w = image.naturalWidth * scale
        const h = image.naturalHeight * scale
        ctx.drawImage(image, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
      }
      ctx.imageSmoothingQuality = 'high'
      ctx.globalAlpha = 1
      paint(img)
      if (mix > 0.02 && b !== a && ready(next)) {
        ctx.globalAlpha = mix
        paint(next)
        ctx.globalAlpha = 1
      }

      lastDrawnRef.current = step
      if (counterRef?.current) {
        counterRef.current.textContent = String((mix < 0.5 ? a : b) + 1).padStart(3, '0')
      }
    },
    [timeline, counterRef]
  )

  // Preload: the first clip gates the loader, the rest stream in behind it
  useEffect(() => {
    let cancelled = false
    const images = []
    const firstCount = sequences[0].count
    let firstLoaded = 0

    const firstDone = () => {
      if (cancelled) return
      firstLoaded++
      callbacksRef.current.onProgress?.(Math.round((firstLoaded / firstCount) * 100))
      if (firstLoaded === firstCount) {
        callbacksRef.current.onLoaded?.()
        draw(true)
        loadRest()
      }
    }

    const load = (flat, dir, i, onDone) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (cancelled) return
        if (flat === 0) draw(true)
        onDone?.()
      }
      img.onerror = () => onDone?.()
      img.src = framePath(dir, i)
      images[flat] = img
    }

    for (let i = 0; i < firstCount; i++) load(i, sequences[0].dir, i, firstDone)

    function loadRest() {
      let flat = firstCount
      sequences.slice(1).forEach((seq) => {
        for (let i = 0; i < seq.count; i++) load(flat++, seq.dir, i, () => draw(true))
      })
    }

    imagesRef.current = images
    return () => {
      cancelled = true
    }
  }, [sequences, draw])

  // Match the backing store to the element's layout size (ignores transforms)
  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        draw(true)
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    return () => ro.disconnect()
  }, [draw])

  // Scroll → timeline position. The walkthrough completes as the footer arrives.
  useEffect(() => {
    const tween = gsap.to(frameRef.current, {
      value: timeline.length,
      ease: 'none',
      onUpdate: () => draw(),
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        endTrigger: '#contact',
        end: 'top bottom',
        scrub: 1,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [timeline, draw])

  return <canvas ref={canvasRef} className="frame-canvas" />
}
