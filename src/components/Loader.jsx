/**
 * Loader — wordmark, a thin progress rule and a counter. Wipes upward when done.
 *
 * Props:
 *  - progress: 0–100
 *  - loaded: boolean — when true, the overlay wipes away
 */
export default function Loader({ progress, loaded }) {
  return (
    <div className={`loader${loaded ? ' is-done' : ''}`} aria-hidden={loaded}>
      <div className="loader-inner">
        <div className="loader-row">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true" />
            Archviz
          </span>
          <span className="loader-percent mono" role="status" aria-live="polite">
            {String(progress).padStart(3, '0')}
          </span>
        </div>
        <div className="loader-track">
          <div className="loader-fill" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <p className="loader-caption">Preparing the walkthrough</p>
      </div>
    </div>
  )
}
