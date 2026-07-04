import { useCallback, useEffect, useRef, useState } from 'react'
import { clamp, lerp } from './colorUtils'

// Pleasant "breathing" pulse used whenever there's no live audio input,
// so the lights still feel alive before mic permission is granted.
export function fallbackLevel(now) {
  const t = now / 1000
  const raw =
    0.35 +
    0.25 * Math.sin(t * 0.9) +
    0.15 * Math.sin(t * 2.3 + 1.3) +
    0.1 * Math.sin(t * 5.1 + 0.4)
  return clamp(raw, 0, 1)
}

// Manages optional microphone-reactive audio level.
// Returns a ref (not state) so the render loop can read it every frame
// without triggering React re-renders.
export function useMicLevel() {
  const [status, setStatus] = useState('off') // off | requesting | on | denied | unsupported
  const levelRef = useRef(0)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const dataRef = useRef(null)
  const streamRef = useRef(null)

  const teardown = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    analyserRef.current = null
    dataRef.current = null
  }, [])

  const enableMic = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      return
    }
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const audioCtx = new AudioCtx()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      streamRef.current = stream
      audioCtxRef.current = audioCtx
      analyserRef.current = analyser
      dataRef.current = new Uint8Array(analyser.frequencyBinCount)
      setStatus('on')
    } catch {
      setStatus('denied')
    }
  }, [])

  const disableMic = useCallback(() => {
    teardown()
    setStatus('off')
  }, [teardown])

  useEffect(() => () => teardown(), [teardown])

  // Called every animation frame by the renderer loop.
  const sampleLevel = useCallback((now) => {
    const analyser = analyserRef.current
    const data = dataRef.current
    let target
    if (analyser && data) {
      analyser.getByteFrequencyData(data)
      const bassBins = Math.floor(data.length * 0.5)
      let sum = 0
      for (let i = 0; i < bassBins; i++) sum += data[i]
      const avg = sum / bassBins / 255
      target = clamp(avg * 1.9, 0, 1)
    } else {
      target = fallbackLevel(now)
    }
    levelRef.current = lerp(levelRef.current, target, 0.25)
    return levelRef.current
  }, [])

  return { status, levelRef, enableMic, disableMic, sampleLevel }
}
