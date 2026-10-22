import { useState, useEffect } from 'react'

/**
 * Navbar — fixed top bar. Sits light-on-video at the top, then gains a solid
 * surface and hairline border once scrolled.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`navbar${scrolled ? ' is-scrolled' : ''}`}>
      <a href="#hero" className="brand" aria-label="Archviz — back to top">
        <span className="brand-mark" aria-hidden="true" />
        Archviz
      </a>

      <a href="#contact" className="btn btn-primary btn-sm">
        Get in touch
      </a>
    </header>
  )
}
