// Pluggable colour themes for the disco light engine.
// Palettes are original — inspired by the *mood* of favourite kids' movies/genres,
// not their logos, characters, or trademarked artwork.
export const THEMES = [
  {
    id: 'classic-disco',
    name: 'Classic Disco',
    emoji: '🪩',
    background: ['#0b0210', '#000000'],
    beamColors: ['#ff3b3b', '#ff9f1c', '#ffe14d', '#4dff88', '#4dc8ff', '#a24dff', '#ff4dd2'],
    sparkleColors: ['#ffffff', '#ffe680', '#ffd1f0'],
    ballTint: '#ffffff',
  },
  {
    id: 'pop-star',
    name: 'Pop Star Neon',
    emoji: '🎤',
    background: ['#1a0033', '#050014'],
    beamColors: ['#ff2ec4', '#b026ff', '#00e5ff', '#ff6ec7', '#7c4dff'],
    sparkleColors: ['#ffffff', '#ff9ee8', '#c9a2ff'],
    ballTint: '#ff8fe0',
  },
  {
    id: 'ice-kingdom',
    name: 'Ice Kingdom',
    emoji: '❄️',
    background: ['#031224', '#000509'],
    beamColors: ['#7ec8ff', '#a6e8ff', '#c9b6ff', '#ffffff', '#4fd8c9'],
    sparkleColors: ['#ffffff', '#d6f3ff', '#e6e0ff'],
    ballTint: '#bfe9ff',
  },
  {
    id: 'wild-savanna',
    name: 'Wild Savanna',
    emoji: '🦁',
    background: ['#1a1206', '#080502'],
    beamColors: ['#ff9f1c', '#ffd23f', '#3ec9a7', '#ff6b6b', '#6a5acd'],
    sparkleColors: ['#fff3c4', '#ffe0a3', '#ffffff'],
    ballTint: '#ffcf6b',
  },
  {
    id: 'unicorn-dreams',
    name: 'Unicorn Dreams',
    emoji: '🦄',
    background: ['#1c0e2b', '#08040f'],
    beamColors: ['#ff9ee8', '#c9a2ff', '#9ee8ff', '#9effc4', '#ffe29e'],
    sparkleColors: ['#ffffff', '#ffd6f7', '#d6f7ff'],
    ballTint: '#ffe2fa',
  },
  {
    id: 'under-the-sea',
    name: 'Under the Sea',
    emoji: '🧜',
    background: ['#001a26', '#00060a'],
    beamColors: ['#00e0ff', '#00b8a9', '#7cf5c4', '#ff8fa3', '#7c83ff'],
    sparkleColors: ['#ffffff', '#bff7ff', '#d4fff0'],
    ballTint: '#8fe9ff',
  },
  {
    id: 'space-galaxy',
    name: 'Space Galaxy',
    emoji: '🚀',
    background: ['#0a0420', '#010005'],
    beamColors: ['#7c4dff', '#00c8ff', '#ff4dd2', '#4dffb8', '#ffe14d'],
    sparkleColors: ['#ffffff', '#c9a2ff', '#9ee8ff'],
    ballTint: '#c9b6ff',
  },
]

export const DEFAULT_THEME_ID = THEMES[0].id

export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0]
}
