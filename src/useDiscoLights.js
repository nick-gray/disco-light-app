import { useEffect, useRef } from 'react'
import { createDiscoRenderer } from './discoRenderer'
import { useMicLevel } from './useMicLevel'

export function useDiscoLights(canvasRef, theme) {
  const mic = useMicLevel()
  const rendererRef = useRef(null)
  const themeRef = useRef(theme)
  themeRef.current = theme

  useEffect(() => {
    rendererRef.current = createDiscoRenderer(theme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    rendererRef.current?.setTheme(theme, performance.now())
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let rafId

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function tick(now) {
      const level = mic.sampleLevel(now)
      rendererRef.current?.render(ctx, window.innerWidth, window.innerHeight, now, level)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef])

  return { micStatus: mic.status, enableMic: mic.enableMic, disableMic: mic.disableMic }
}
