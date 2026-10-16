import { GLYPHS } from './font'

export const CELL = 2
export const GH = 32

export type Act = { kind: string; label: string; detail: string; steps: number; trail: string[] }

export const C = {
  bg: '#262624', card: '#30302E', line: '#4A4A46', dim: '#3D3D3A', text: '#FAF9F5', sub: '#B0AEA5',
  coral: '#E86E4B', plus: '#37D67A', warn: '#FFB020', minus: '#FF5A5A',
  body: '#d97757', leg: '#b85f42', eye: '#2a1712', moon: '#E8E6DF',
  far: '#2B2B29', walk: '#3A3A37', road: '#1F1E1D', term: '#1F1E1D',
}

export const levelColor = (pct: number) => (pct >= 90 ? C.minus : pct >= 70 ? C.warn : C.plus)

export const kindColor = (kind: string) =>
  ({ edit: C.coral, run: C.warn, search: C.plus, done: C.plus, error: C.minus } as Record<string, string>)[kind] ?? C.text

export const rect = (x: number, y: number, w: number, h: number, fill: string, rx = 0, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rx ? ` rx="${rx}"` : ''}${extra}/>`

export const anim = (attr: string, values: string, dur: string, extra = '') =>
  `<animate attributeName="${attr}" values="${values}" dur="${dur}" repeatCount="indefinite"${extra}/>`

export const textWidth = (s: string) => Math.max(0, s.length * 6 - 1)

export const text = (s: string, x: number, y: number, fill: string) => {
  let out = ''
  let cx = x
  for (const ch of s.toUpperCase()) {
    const rows = GLYPHS[ch]
    if (rows) {
      rows.forEach((row, ry) => {
        for (let i = 0; i < row.length; i++) if (row[i] === '1') out += rect(cx + i, y + ry, 1, 1, fill)
      })
    }
    cx += 6
  }
  return out
}

export const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
