import { useEffect, useMemo, useRef, useState } from 'react'
import { THEMES, DEFAULT_THEME_ID, getThemeById } from './themes'
import { useDiscoLights } from './useDiscoLights'
import './App.css'

const STORAGE_KEY = 'disco-light-theme'
const SPARK_STORAGE_KEY = 'disco-light-spark'

const SPARK_LEVELS = [
  { id: 'calm', label: 'Calm', emoji: '✨', factor: 0.55 },
  { id: 'party', label: 'Party', emoji: '🌟', factor: 1 },
  { id: 'max', label: 'Max', emoji: '💥', factor: 1.7 },
]
const DEFAULT_SPARK_ID = 'party'

const MIC_LABEL = {
  off: 'Turn mic on 🎙️',
  requesting: 'Asking for mic…',
  on: 'Mic on — listening 🎶',
  denied: 'Mic blocked — check browser settings',
  unsupported: 'Mic not supported here',
}

function App() {
  const canvasRef = useRef(null)
  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME_ID
    } catch {
      return DEFAULT_THEME_ID
    }
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sparkLevelId, setSparkLevelId] = useState(() => {
    try {
      return localStorage.getItem(SPARK_STORAGE_KEY) || DEFAULT_SPARK_ID
    } catch {
      return DEFAULT_SPARK_ID
    }
  })

  const theme = useMemo(() => getThemeById(themeId), [themeId])
  const sparkFactor = useMemo(
    () => (SPARK_LEVELS.find((s) => s.id === sparkLevelId) || SPARK_LEVELS[1]).factor,
    [sparkLevelId]
  )
  const { micStatus, enableMic, disableMic } = useDiscoLights(canvasRef, theme, sparkFactor)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, themeId)
    } catch {
      // private browsing etc. — fine to skip persisting
    }
  }, [themeId])

  useEffect(() => {
    try {
      localStorage.setItem(SPARK_STORAGE_KEY, sparkLevelId)
    } catch {
      // private browsing etc. — fine to skip persisting
    }
  }, [sparkLevelId])

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function cycleTheme() {
    const idx = THEMES.findIndex((t) => t.id === themeId)
    setThemeId(THEMES[(idx + 1) % THEMES.length].id)
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  function toggleMic() {
    if (micStatus === 'on') {
      disableMic()
    } else {
      enableMic()
    }
  }

  return (
    <div
      className="stage"
      onClick={() => {
        if (!settingsOpen) cycleTheme()
      }}
    >
      <canvas ref={canvasRef} className="stage-canvas" />

      <div className="theme-badge" aria-hidden="true">
        <span className="theme-badge-emoji">{theme.emoji}</span>
        <span>{theme.name}</span>
      </div>

      <button
        type="button"
        className="gear-button"
        aria-label="Settings"
        onClick={(e) => {
          e.stopPropagation()
          setSettingsOpen((v) => !v)
        }}
      >
        ⚙️
      </button>

      <button
        type="button"
        className={`mic-button mic-button-${micStatus}`}
        aria-label={MIC_LABEL[micStatus]}
        aria-pressed={micStatus === 'on'}
        title={MIC_LABEL[micStatus]}
        onClick={(e) => {
          e.stopPropagation()
          toggleMic()
        }}
      >
        {micStatus === 'on' ? '🎤' : '🎙️'}
      </button>

      <div className="spark-bar" onClick={(e) => e.stopPropagation()}>
        {SPARK_LEVELS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`spark-button ${s.id === sparkLevelId ? 'active' : ''}`}
            aria-label={`Spark level: ${s.label}`}
            aria-pressed={s.id === sparkLevelId}
            onClick={(e) => {
              e.stopPropagation()
              setSparkLevelId(s.id)
            }}
          >
            <span className="spark-button-emoji">{s.emoji}</span>
            <span className="spark-button-label">{s.label}</span>
          </button>
        ))}
      </div>

      {settingsOpen && (
        <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
          <div className="settings-header">
            <h2>Disco Settings</h2>
            <button
              type="button"
              className="close-button"
              aria-label="Close settings"
              onClick={() => setSettingsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="theme-grid">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-tile ${t.id === themeId ? 'active' : ''}`}
                onClick={() => setThemeId(t.id)}
                style={{
                  background: `linear-gradient(135deg, ${t.beamColors[0]}, ${t.beamColors[2] || t.beamColors[1]})`,
                }}
              >
                <span className="theme-tile-emoji">{t.emoji}</span>
                <span className="theme-tile-name">{t.name}</span>
              </button>
            ))}
          </div>

          <button type="button" className="panel-button" onClick={toggleFullscreen}>
            {isFullscreen ? 'Exit fullscreen' : 'Go fullscreen ⛶'}
          </button>

          <p className="hint">Tap anywhere on the lights to change the theme.</p>
        </div>
      )}
    </div>
  )
}

export default App
