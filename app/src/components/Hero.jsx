import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from './Icons'

gsap.registerPlugin(ScrollTrigger)

/**
 * Hero — centred opening statement over the walkthrough.
 * Intro plays once the loader has cleared; on scroll the copy drifts up and
 * the scrim lifts so the video takes over.
 */
export default function Hero({ ready }) {
  const heroRef = useRef(null)

  useEffect(() => {
    if (!ready) return
    const el = heroRef.current

    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.35, defaults: { ease: 'expo.out', duration: 1.2 } })
        .from('.hero-eyebrow', { opacity: 0, y: 14, duration: 0.9 })
        .from('.hero-title .line > span', { yPercent: 115, stagger: 0.09, duration: 1.4 }, '-=0.6')
        .from('.hero-reveal', { opacity: 0, y: 18, stagger: 0.08 }, '-=1')

      const scroll = { trigger: el, start: 'top top', end: 'bottom 30%', scrub: true }
      gsap.to('.hero-content', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: scroll })
      // The scrim lives in the Stage, outside this context's scope
      gsap.to(document.querySelector('.stage-scrim'), {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { ...scroll },
      })
    }, el)

    return () => ctx.revert()
  }, [ready])

  return (
    <section className={`hero${ready ? '' : ' is-pending'}`} ref={heroRef} id="hero">
      <div className="hero-content">
        <span className="badge hero-eyebrow">Architectural walkthrough</span>

        <h1 className="hero-title">
          <span className="line"><span>Architecture,</span></span>
          <span className="line"><span><em>in motion.</em></span></span>
        </h1>

        <p className="lead hero-reveal">
          Scroll to move through a space before it is built — each frame a measured
          step through light, material and form.
        </p>

        <div className="hero-actions hero-reveal">
          <a href="#walkthrough" className="btn btn-hero-primary">
            Begin the walkthrough
            <ArrowRight className="btn-icon" />
          </a>
          <a href="#contact" className="btn btn-hero-outline">
            Get in touch
          </a>
        </div>
      </div>
    </section>
  )
}
