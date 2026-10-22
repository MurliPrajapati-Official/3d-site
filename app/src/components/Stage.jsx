import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import FrameCanvas from './FrameCanvas'

/**
 * Stage — the full-screen, fixed background that holds the scroll-driven
 * walkthrough, a flat scrim for hero legibility and a frame counter.
 */
export default function Stage({ sequences, ready, onProgress, onLoaded }) {
  const total = sequences.reduce((sum, s) => sum + s.count, 0)
  const stageRef = useRef(null)
  const counterRef = useRef(null)

  // Reveal: the image settles in scale as the loader wipes away
  useEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('.frame-canvas', { scale: 1.15, duration: 2.6 }, 0)
        .from('.stage-chip', { opacity: 0, y: 8, duration: 1 }, 1.2)
    }, stageRef)
    return () => ctx.revert()
  }, [ready])

  return (
    <div className="stage" ref={stageRef}>
      <FrameCanvas
        sequences={sequences}
        onProgress={onProgress}
        onLoaded={onLoaded}
        counterRef={counterRef}
      />
      <div className="stage-scrim" aria-hidden="true" />
      <span className="stage-chip mono" aria-hidden="true">
        <span ref={counterRef}>001</span>
        <span className="muted">/ {total}</span>
      </span>
    </div>
  )
}
