import { lerpColor, toRgba, easeInOutQuad, clamp } from './colorUtils'

const BEAM_COUNT = 10
const SPARKLE_COUNT = 220
const GLINT_COUNT = 16
const THEME_FADE_MS = 900
// Fractional positions along each beam's length where a small twinkling
// point-sparkle rides, so the beams themselves look sparkly, not just solid.
const BEAM_SPARK_POSITIONS = [0.15, 0.35, 0.55, 0.75, 0.9]

function randomRange(min, max) {
  return min + Math.random() * (max - min)
}

function createBeams() {
  return Array.from({ length: BEAM_COUNT }, (_, i) => ({
    i,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: randomRange(0.2, 0.5),
    sparkPhases: BEAM_SPARK_POSITIONS.map(() => Math.random() * Math.PI * 2),
    sparkSpeeds: BEAM_SPARK_POSITIONS.map(() => randomRange(3.5, 5.5)),
  }))
}

function createSparkles() {
  return Array.from({ length: SPARKLE_COUNT }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: randomRange(1.2, 3.2),
    phase: Math.random() * Math.PI * 2,
    speed: randomRange(0.6, 1.8),
    colorIndex: Math.floor(Math.random() * 5),
  }))
}

function createGlints() {
  return Array.from({ length: GLINT_COUNT }, (_, i) => ({
    angle: (i / GLINT_COUNT) * Math.PI * 2,
    phase: Math.random() * Math.PI * 2,
  }))
}

export function createDiscoRenderer(initialTheme) {
  const beams = createBeams()
  const sparkles = createSparkles()
  const glints = createGlints()

  let transition = { from: initialTheme, to: initialTheme, start: 0, duration: THEME_FADE_MS }
  let globalAngle = 0
  let lastTime = null

  function setTheme(newTheme, now) {
    if (newTheme.id === transition.to.id) return
    transition = { from: transition.to, to: newTheme, start: now, duration: THEME_FADE_MS }
  }

  function fadeT(now) {
    if (transition.duration === 0) return 1
    return easeInOutQuad(clamp((now - transition.start) / transition.duration, 0, 1))
  }

  function colorFromArray(prop, index, now) {
    const t = fadeT(now)
    const fromArr = transition.from[prop]
    const toArr = transition.to[prop]
    const c1 = fromArr[index % fromArr.length]
    const c2 = toArr[index % toArr.length]
    return lerpColor(c1, c2, t)
  }

  function colorSingle(prop, now) {
    const t = fadeT(now)
    return lerpColor(transition.from[prop], transition.to[prop], t)
  }

  function render(ctx, width, height, now, level, sparkFactor = 1) {
    if (lastTime === null) lastTime = now
    const dt = clamp((now - lastTime) / 1000, 0, 0.05)
    lastTime = now

    globalAngle += (0.12 + level * 0.55) * sparkFactor * dt

    // Background
    const bgInner = colorFromArray('background', 0, now)
    const bgOuter = colorFromArray('background', 1, now)
    const radius = Math.max(width, height) * 0.75
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, radius)
    bgGrad.addColorStop(0, toRgba(bgInner, 1))
    bgGrad.addColorStop(1, toRgba(bgOuter, 1))
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(width / 2, height / 2)

    // Rotating colour beams
    ctx.globalCompositeOperation = 'lighter'
    const beamLength = Math.min(width, height) * clamp(0.5 + level * 0.35, 0, 1) * clamp(sparkFactor, 0.4, 1.8)
    beams.forEach((beam) => {
      const wobble = Math.sin(now / 1000 * beam.wobbleSpeed + beam.wobble) * 0.06
      const angle = globalAngle + (beam.i / BEAM_COUNT) * Math.PI * 2 + wobble
      const color = colorFromArray('beamColors', beam.i, now)
      const x2 = Math.cos(angle) * beamLength
      const y2 = Math.sin(angle) * beamLength
      const grad = ctx.createLinearGradient(0, 0, x2, y2)
      grad.addColorStop(0, toRgba(color, clamp((0.5 + level * 0.35) * sparkFactor, 0, 1)))
      grad.addColorStop(1, toRgba(color, 0))
      ctx.strokeStyle = grad
      ctx.lineWidth = Math.min(width, height) * clamp((0.045 + level * 0.03) * sparkFactor, 0.01, 0.12)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Small twinkling sparkles riding along the beam, recomputed every
      // frame from this beam's current angle/length so they travel and
      // pulse with it as it rotates.
      BEAM_SPARK_POSITIONS.forEach((t, si) => {
        const twinkle = (Math.sin(now / 1000 * beam.sparkSpeeds[si] + beam.sparkPhases[si]) + 1) / 2
        const bright = clamp(twinkle * (0.45 + level * 0.55) * sparkFactor, 0, 1)
        if (bright < 0.04) return
        const sx = Math.cos(angle) * beamLength * t
        const sy = Math.sin(angle) * beamLength * t
        const sSize = Math.min(width, height) * (0.005 + twinkle * 0.009) * clamp(sparkFactor, 0.6, 1.6)
        ctx.beginPath()
        ctx.arc(sx, sy, sSize, 0, Math.PI * 2)
        ctx.fillStyle = toRgba([255, 255, 255], bright)
        ctx.shadowColor = toRgba(color, bright)
        ctx.shadowBlur = 10
        ctx.fill()
      })
    })
    ctx.shadowBlur = 0

    // Centre disco ball
    const ballR = Math.min(width, height) * 0.085
    const ballTint = colorSingle('ballTint', now)
    const ballGrad = ctx.createRadialGradient(
      -ballR * 0.35, -ballR * 0.35, ballR * 0.1,
      0, 0, ballR
    )
    ballGrad.addColorStop(0, '#ffffff')
    ballGrad.addColorStop(0.4, toRgba(ballTint, 1))
    ballGrad.addColorStop(1, toRgba([20, 20, 30], 1))
    ctx.globalCompositeOperation = 'source-over'
    ctx.beginPath()
    ctx.arc(0, 0, ballR, 0, Math.PI * 2)
    ctx.fillStyle = ballGrad
    ctx.fill()

    // Glints catching the light as the ball spins
    ctx.globalCompositeOperation = 'lighter'
    glints.forEach((glint) => {
      const angle = glint.angle + globalAngle * 1.4
      const gx = Math.cos(angle) * ballR * 0.72
      const gy = Math.sin(angle) * ballR * 0.72
      const twinkle = (Math.sin(now / 260 + glint.phase) + 1) / 2
      const bright = clamp(twinkle * (0.5 + level * 0.5) * sparkFactor, 0, 1)
      ctx.beginPath()
      ctx.arc(gx, gy, ballR * 0.06, 0, Math.PI * 2)
      ctx.fillStyle = toRgba([255, 255, 255], bright)
      ctx.shadowColor = toRgba([255, 255, 255], bright)
      ctx.shadowBlur = 6
      ctx.fill()
    })
    ctx.shadowBlur = 0
    ctx.restore()

    // Twinkling sparkles across the whole sky
    ctx.globalCompositeOperation = 'lighter'
    sparkles.forEach((p) => {
      const rawTwinkle = (Math.sin((now / 1000) * p.speed + p.phase) + 1) / 2
      // Never let a sparkle fully vanish, even at the calm spark level —
      // a small floor keeps the whole field readable as "many sparkles"
      // instead of most of them sitting invisible between twinkle peaks.
      const twinkle = Math.max(rawTwinkle, 0.22)
      const alpha = clamp(twinkle * (0.55 + level * 0.45) * clamp(sparkFactor, 0.65, 1.8), 0.08, 1)
      if (rawTwinkle < 0.02 && Math.random() < 0.02) {
        p.x = Math.random()
        p.y = Math.random()
      }
      const color = colorFromArray('sparkleColors', p.colorIndex, now)
      const size = p.size * (0.7 + twinkle * 0.9) * clamp(sparkFactor, 0.5, 1.8)
      const px = p.x * width
      const py = p.y * height
      ctx.beginPath()
      ctx.arc(px, py, size, 0, Math.PI * 2)
      ctx.fillStyle = toRgba(color, alpha)
      ctx.shadowColor = toRgba(color, alpha)
      ctx.shadowBlur = 8
      ctx.fill()
    })
    ctx.shadowBlur = 0
    ctx.globalCompositeOperation = 'source-over'
  }

  return { render, setTheme }
}
