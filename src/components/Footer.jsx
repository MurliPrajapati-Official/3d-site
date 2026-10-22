import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight } from './Icons'

gsap.registerPlugin(ScrollTrigger)

const EMAIL = 'hello@archviz.studio'
const YEAR = new Date().getFullYear()

/**
 * Footer — closing call to action, contact details and site links.
 */
export default function Footer() {
  const footerRef = useRef(null)

  useEffect(() => {
    const el = footerRef.current
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: 'expo.out', duration: 1.2 },
          scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none reverse' },
        })
        .from('.footer-title .line > span', { yPercent: 115, stagger: 0.08, duration: 1.4 })
        .from('.footer-reveal', { opacity: 0, y: 14, stagger: 0.07 }, 0.25)
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <footer className="footer" id="contact" ref={footerRef}>
      <div className="footer-inner">
        <div className="footer-cta">
          <p className="eyebrow footer-reveal">Start a project</p>
          <h2 className="footer-title">
            <span className="line"><span>Let’s walk through</span></span>
            <span className="line"><span><em>your next space.</em></span></span>
          </h2>
          <div className="footer-actions footer-reveal">
            <a href={`mailto:${EMAIL}`} className="btn btn-primary btn-lg">
              Email the studio
              <ArrowUpRight className="btn-icon btn-icon-diag" />
            </a>
            <span className="muted">We reply within two working days.</span>
          </div>
        </div>

        <dl className="footer-details footer-reveal">
          <div>
            <dt>Enquiries</dt>
            <dd><a className="link" href={`mailto:${EMAIL}`}>{EMAIL}</a></dd>
          </div>
          <div>
            <dt>Studio</dt>
            <dd>Walkthroughs, visualisation &amp; spatial design</dd>
          </div>
        </dl>

        <div className="footer-bottom">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true" />
            Archviz
          </span>
          <span className="muted">© {YEAR} Archviz Studio. All rights reserved.</span>
          <a href="#hero" className="link">Back to top ↑</a>
        </div>
      </div>
    </footer>
  )
}
