import { lerpColor, toRgba, easeInOutQuad, clamp } from './colorUtils'

const BEAM_COUNT = 10
const SPARKLE_COUNT = 110
const GLINT_COUNT = 16
const THEME_FADE_MS = 900

function randomRange(min, max) {
  return min + Math.random() * (max - min)
}

function createBeams() {
  return Array.from({ length: BEAM_COUNT }, (_, i) => ({
    i,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: randomRange(0.2, 0.5),
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

  function render(ctx, width, height, now, level) {
    if (lastTime === null) lastTime = now
    const dt = clamp((now - lastTime) / 1000, 0, 0.05)
    lastTime = now

    globalAngle += (0.12 + level * 0.55) * dt

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
    const beamLength = Math.min(width, height) * (0.5 + level * 0.35)
    beams.forEach((beam) => {
      const wobble = Math.sin(now / 1000 * beam.wobbleSpeed + beam.wobble) * 0.06
      const angle = globalAngle + (beam.i / BEAM_COUNT) * Math.PI * 2 + wobble
      const color = colorFromArray('beamColors', beam.i, now)
      const x2 = Math.cos(angle) * beamLength
      const y2 = Math.sin(angle) * beamLength
      const grad = ctx.createLinearGradient(0, 0, x2, y2)
      grad.addColorStop(0, toRgba(color, 0.5 + level * 0.35))
      grad.addColorStop(1, toRgba(color, 0))
      ctx.strokeStyle = grad
      ctx.lineWidth = Math.min(width, height) * (0.045 + level * 0.03)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    })

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
      const bright = twinkle * (0.5 + level * 0.5)
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
      const twinkle = (Math.sin((now / 1000) * p.speed + p.phase) + 1) / 2
      const alpha = twinkle * (0.55 + level * 0.45)
      if (twinkle < 0.02 && Math.random() < 0.02) {
        p.x = Math.random()
        p.y = Math.random()
      }
      const color = colorFromArray('sparkleColors', p.colorIndex, now)
      const size = p.size * (0.7 + twinkle * 0.9)
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
