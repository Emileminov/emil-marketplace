import { GLYPHS } from './font'

export const CELL = 2
export const GH = 32

export type Kind = 'idle' | 'think' | 'read' | 'edit' | 'run' | 'search' | 'agent' | 'done' | 'error'
export type Act = { kind: string; label: string; detail: string; steps: number; trail: string[] }

const C = {
  bg: '#262624', card: '#30302E', line: '#4A4A46', dim: '#3D3D3A', text: '#FAF9F5', sub: '#B0AEA5',
  coral: '#E86E4B', plus: '#37D67A', warn: '#FFB020', minus: '#FF5A5A',
  body: '#d97757', leg: '#b85f42', eye: '#2a1712', moon: '#E8E6DF',
  far: '#2B2B29', walk: '#3A3A37', road: '#1F1E1D', term: '#1F1E1D',
}

export const kindColor = (kind: string) =>
  ({ edit: C.coral, run: C.warn, search: C.plus, done: C.plus, error: C.minus } as Record<string, string>)[kind] ?? C.text

const rect = (x: number, y: number, w: number, h: number, fill: string, rx = 0, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rx ? ` rx="${rx}"` : ''}${extra}/>`

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

const anim = (attr: string, values: string, dur: string, extra = '') =>
  `<animate attributeName="${attr}" values="${values}" dur="${dur}" repeatCount="indefinite"${extra}/>`

const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

// Klodik at origin (0..14 wide, standing on y=28), plus the prop for what he is doing.
const klodik = (kind: string) => {
  const armR = kind === 'done'
    ? `<rect x="14" y="16" width="2" height="2" rx="0.8" fill="${C.body}">${anim('y', '16;14;16', '0.5s')}</rect>`
    : kind === 'edit'
      ? `<rect x="14" y="22" width="2" height="2" rx="0.8" fill="${C.body}">${anim('y', '22;25;22', '0.22s')}</rect>`
      : `<rect x="14" y="22" width="2" height="2" rx="0.8" fill="${C.body}"/>`
  const armL = kind === 'done'
    ? `<rect x="-2" y="16" width="2" height="2" rx="0.8" fill="${C.body}">${anim('y', '16;14;16', '0.5s', ' begin="0.25s"')}</rect>`
    : rect(-2, 22, 2, 2, C.body, 0.8)
  const eyeH = kind === 'idle' ? 1 : 4
  const eyeY = kind === 'idle' ? 22 : 20
  const look = kind === 'read' || kind === 'edit' || kind === 'run' || kind === 'search' ? 1 : 0
  const eye = (x: number) =>
    `<rect x="${x + look}" y="${eyeY}" width="2" height="${eyeH}" rx="1" fill="${C.eye}">${kind === 'idle' ? '' : anim('height', '4;4;1;4', '4s', ' keyTimes="0;0.9;0.95;1"')}</rect>`
  const walk = (b: number) =>
    `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1;0 0" dur="0.5s" begin="${b}s" repeatCount="indefinite"/>`
  const legs = kind === 'search' || kind === 'agent'
    ? `<g>${walk(0)}${rect(1, 26, 2, 2, C.leg, 0.6)}${rect(9, 26, 2, 2, C.leg, 0.6)}</g><g>${walk(0.25)}${rect(4, 26, 2, 2, C.leg, 0.6)}${rect(12, 26, 2, 2, C.leg, 0.6)}</g>`
    : [1, 4, 9, 12].map(x => rect(x, 26, 2, 2, C.leg, 0.6)).join('')
  const shake = kind === 'error'
    ? `<animateTransform attributeName="transform" type="translate" values="0 0;-1 0;1 0;0 0" dur="0.3s" repeatCount="indefinite"/>`
    : ''
  let prop = ''
  if (kind === 'read') {
    prop = rect(20, 12, 13, 16, C.card, 2) + rect(20, 12, 13, 16, 'none', 2, ` stroke="${C.line}" stroke-width="1"`) +
      [15, 18, 21, 24].map(y => rect(22, y, 9, 1, C.dim)).join('') +
      `<rect x="21" y="14" width="11" height="1" fill="${C.coral}">${anim('y', '14;25;14', '1.8s')}</rect>`
  } else if (kind === 'edit') {
    prop = rect(18, 16, 15, 10, C.card, 2) + rect(18, 16, 15, 10, 'none', 2, ` stroke="${C.line}" stroke-width="1"`) +
      [0, 1, 2].map(i => `<rect x="20" y="${18 + i * 2.6}" width="${8 + (i % 2) * 3}" height="1" fill="${C.coral}">${anim('opacity', '0.2;1;0.2', '1.2s', ` begin="${i * 0.3}s"`)}</rect>`).join('') +
      rect(16, 26, 19, 2, C.line, 1)
  } else if (kind === 'run') {
    prop = rect(18, 13, 19, 15, C.term, 2) + rect(18, 13, 19, 15, 'none', 2, ` stroke="${C.line}" stroke-width="1"`) +
      rect(18, 13, 19, 3, C.line, 2) +
      rect(21, 19, 1, 1, C.warn) + rect(22, 20, 1, 1, C.warn) + rect(21, 21, 1, 1, C.warn) +
      `<rect x="25" y="21" width="4" height="1" fill="${C.warn}">${anim('opacity', '1;0;1', '1s')}</rect>` +
      rect(21, 24, 9, 1, C.dim)
  } else if (kind === 'search') {
    prop = `<g><animateTransform attributeName="transform" type="translate" values="0 0;10 0;0 0" dur="2.4s" repeatCount="indefinite"/>` +
      `<circle cx="26" cy="19" r="5" fill="none" stroke="${C.plus}" stroke-width="1.6"/>` +
      `<path d="M30 23l5 5" stroke="${C.plus}" stroke-width="1.8" stroke-linecap="round"/></g>`
  } else if (kind === 'agent') {
    prop = `<g>${rect(22, 21, 9, 6, C.body, 2)}${rect(24, 23, 1, 2, C.eye, 0.5)}${rect(28, 23, 1, 2, C.eye, 0.5)}` +
      rect(23, 27, 1, 1, C.leg) + rect(29, 27, 1, 1, C.leg) +
      `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1;0 0" dur="0.6s" repeatCount="indefinite"/></g>`
  } else if (kind === 'think') {
    prop = rect(-1, 3, 17, 10, C.card, 3) + rect(-1, 3, 17, 10, 'none', 3, ` stroke="${C.line}" stroke-width="1"`) +
      [0, 1, 2].map(i => `<rect x="${3 + i * 4}" y="7" width="2" height="2" rx="1" fill="${C.text}">${anim('opacity', '0.2;1;0.2', '1.2s', ` begin="${i * 0.25}s"`)}</rect>`).join('') +
      `<path d="M5 13h3l-1.5 2z" fill="${C.card}"/>`
  } else if (kind === 'done') {
    prop = [[22, 12], [28, 20], [-6, 12]].map(([x, y], i) =>
      `<path d="M${x} ${y - 3}v6M${x - 3} ${y}h6" stroke="${C.warn}" stroke-width="1.4" stroke-linecap="round">${anim('opacity', '0;1;0', '1.1s', ` begin="${i * 0.35}s"`)}</path>`).join('')
  } else if (kind === 'error') {
    prop = rect(4, 3, 8, 12, C.minus, 3) + text('!', 7, 5, C.bg)
  } else if (kind === 'idle') {
    prop = [0, 1].map(i => `<g opacity="0">${anim('opacity', '0;0.8;0', '2.4s', ` begin="${i * 1.2}s"`)}<animateTransform attributeName="transform" type="translate" values="0 6;0 0" dur="2.4s" begin="${i * 1.2}s" repeatCount="indefinite"/>${text('Z', 17 + i * 5, 8 - i * 3, C.sub)}</g>`).join('')
  }
  return `<g>${shake}${legs}${armL}${armR}${rect(0, 18, 14, 9, C.body, 3)}${eye(4)}${eye(8)}${prop}</g>`
}

export const buildLive = (gw: number, act: Act) => {
  const W = gw * CELL
  const H = GH * CELL
  const rand = rng(gw + 7)
  const color = kindColor(act.kind)
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gw} ${GH}" width="${W}" height="${H}">`
  s += `<defs><clipPath id="r"><rect width="${gw}" height="${GH}" rx="9"/></clipPath></defs><g clip-path="url(#r)">`
  s += rect(0, 0, gw, GH, C.bg)
  for (let i = 0; i < Math.floor(gw / 16); i++) {
    s += `<rect x="${Math.floor(rand() * gw)}" y="${1 + Math.floor(rand() * 12)}" width="1" height="1" fill="#FAF9F5" opacity="0.25"/>`
  }
  let x = -4
  while (x < gw) {
    const w = 7 + Math.floor(rand() * 10)
    const h = 4 + Math.floor(rand() * 9)
    s += rect(x, 28 - h, w, h + 2, C.far, 2)
    x += w + 2 + Math.floor(rand() * 3)
  }
  s += rect(0, 28, gw, 4, C.walk) + rect(0, 30, gw, 2, C.road)
  const tx = 62
  const maxChars = Math.floor((gw - tx - 52) / 6)
  const label = act.label.slice(0, maxChars)
  const detail = act.detail.slice(0, maxChars)
  s += `<g transform="translate(10 0)">${klodik(act.kind)}</g>`
  s += text(label, tx, 4, color)
  if (detail) s += text(detail, tx, 14, C.sub)
  const steps = act.steps > 0 ? `ШАГ ${act.steps}` : ''
  if (steps) s += text(steps, gw - textWidth(steps) - 14, 4, C.sub)
  // the road shows the path taken: one dot per step, newest on the right
  const dots = act.trail.slice(-Math.floor((gw - tx - 20) / 4))
  dots.forEach((k, i) => {
    const last = i === dots.length - 1
    s += `<rect x="${tx + i * 4}" y="${last ? 22.5 : 23}" width="${last ? 3 : 2}" height="${last ? 3 : 2}" rx="1" fill="${kindColor(k)}">${last ? anim('opacity', '1;0.4;1', '1s') : ''}</rect>`
  })
  return s + '</g></svg>'
}
