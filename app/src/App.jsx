import { useState, useEffect, useCallback } from 'react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Loader from './components/Loader'
import Navbar from './components/Navbar'
import Stage from './components/Stage'
import Hero from './components/Hero'
import Footer from './components/Footer'
import { setLenis, getLenis, scrollToTarget } from './lib/scroll'

gsap.registerPlugin(ScrollTrigger)

// Pre-rendered clips, played back to back as you scroll
const SEQUENCES = [
  { dir: 'frames', count: 152 },
  { dir: 'frames-2', count: 152 },
  // Opens back at the entrance, so it gets a longer, softer crossfade
  { dir: 'frames-3', count: 152, blendIn: 36 },
  // Dining room → kitchen is a scene change; dissolve between them
  { dir: 'frames-4', count: 151, blendIn: 24 },
]

export default function App() {
  const [loadProgress, setLoadProgress] = useState(0)
  const [ready, setReady] = useState(false)

  // Smooth scroll, driven by the GSAP ticker so ScrollTrigger stays in sync
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    setLenis(lenis)
    lenis.stop()
    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // Lock scrolling until the frames are ready
  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', !ready)
    if (ready) {
      getLenis()?.start()
      ScrollTrigger.refresh()
    }
  }, [ready])

  // Route in-page anchor clicks through Lenis
  useEffect(() => {
    const onClick = (e) => {
      const link = e.target.closest('a[href^="#"]')
      if (!link) return
      const href = link.getAttribute('href')
      if (href.length < 2) return
      e.preventDefault()
      scrollToTarget(href)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Top-of-page scroll progress
  useEffect(() => {
    const tween = gsap.to('.scroll-progress', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  const handleLoaded = useCallback(() => {
    // Let the bar visibly settle at 100% before the wipe
    setTimeout(() => setReady(true), 350)
  }, [])

  return (
    <>
      <Loader progress={loadProgress} loaded={ready} />

      <div className="scroll-progress" aria-hidden="true" />

      <Navbar />

      <Stage
        sequences={SEQUENCES}
        ready={ready}
        onProgress={setLoadProgress}
        onLoaded={handleLoaded}
      />

      <main className="scroll-container">
        <Hero ready={ready} />
        {/* Scroll distance that scrubs the walkthrough */}
        <div className="walkthrough-track" id="walkthrough" aria-hidden="true" />
      </main>

      <Footer />
    </>
  )
}
