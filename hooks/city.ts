// Pure SVG builder for the pixel city. One grid unit = 2px, so shapes stay fine.
export const CELL = 2
export const GH = 32

const GLYPHS: Record<string, string> = {
  '0': '01110 10001 10011 10101 11001 10001 01110', '1': '00100 01100 00100 00100 00100 00100 01110',
  '2': '01110 10001 00001 00010 00100 01000 11111', '3': '11110 00001 00001 01110 00001 00001 11110',
  '4': '00010 00110 01010 10010 11111 00010 00010', '5': '11111 10000 11110 00001 00001 10001 01110',
  '6': '00110 01000 10000 11110 10001 10001 01110', '7': '11111 00001 00010 00100 01000 01000 01000',
  '8': '01110 10001 10001 01110 10001 10001 01110', '9': '01110 10001 10001 01111 00001 00010 01100',
  '%': '11001 11010 00010 00100 01000 01011 10011', '-': '00000 00000 00000 11111 00000 00000 00000',
  H: '10001 10001 10001 11111 10001 10001 10001', D: '11110 10001 10001 10001 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110', T: '11111 00100 00100 00100 00100 00100 00100',
  X: '10001 10001 01010 00100 01010 10001 10001', R: '11110 10001 10001 11110 10100 10010 10001',
  E: '11111 10000 10000 11110 10000 10000 11111', S: '01111 10000 10000 01110 00001 00001 11110',
  M: '10001 11011 10101 10101 10001 10001 10001', O: '01110 10001 10001 10001 10001 10001 01110',
  K: '10001 10010 10100 11000 10100 10010 10001', '!': '00100 00100 00100 00100 00100 00000 00100',
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
  P: '11110 10001 10001 11110 10000 10000 10000',
  'А': '01110 10001 10001 11111 10001 10001 10001', 'Б': '11111 10000 10000 11110 10001 10001 11110',
  'В': '11110 10001 10001 11110 10001 10001 11110', 'Д': '00110 01010 01010 01010 01010 11111 10001',
  'Е': '11111 10000 10000 11110 10000 10000 11111', 'К': '10001 10010 10100 11000 10100 10010 10001',
  'Л': '00111 01001 01001 01001 01001 10001 10001', 'М': '10001 11011 10101 10101 10001 10001 10001',
  'Н': '10001 10001 10001 11111 10001 10001 10001', 'О': '01110 10001 10001 10001 10001 10001 01110',
  'Р': '11110 10001 10001 11110 10000 10000 10000', 'С': '01110 10001 10000 10000 10000 10001 01110',
  'Т': '11111 00100 00100 00100 00100 00100 00100', 'Ч': '10001 10001 10001 01111 00001 00001 00001',
  'Я': '01111 10001 10001 01111 00101 01001 10001', ' ': '00000 00000 00000 00000 00000 00000 00000',
  '?': '01110 10001 00001 00010 00100 00000 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
}

const C = {
  bg: '#262624', card: '#30302E', line: '#4A4A46', dim: '#3D3D3A', text: '#FAF9F5', sub: '#B0AEA5',
  coral: '#E86E4B', plus: '#37D67A', warn: '#FFB020', minus: '#FF5A5A',
  plusD: '#37D67A', warnD: '#FFB020', minusD: '#FF5A5A',
  body: '#d97757', leg: '#b85f42', eye: '#2a1712', sun: '#E8E6DF',
  far: '#2B2B29', near: '#31312F', walk: '#3A3A37', road: '#1F1E1D', cloud: '#FAF9F5',
}

export const levelColor = (pct: number) => (pct >= 90 ? C.minus : pct >= 70 ? C.warn : C.plus)
export const levelText = (pct: number) => (pct >= 90 ? C.minusD : pct >= 70 ? C.warnD : C.plusD)

export const textWidth = (s: string) => s.length * 6 - 1

const rect = (x: number, y: number, w: number, h: number, fill: string, rx = 0, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rx ? ` rx="${rx}"` : ''}${extra}/>`

export const text = (s: string, x: number, y: number, fill: string) => {
  let out = ''
  let cx = x
  for (const ch of s.toUpperCase()) {
    const rows = (GLYPHS[ch] ?? '').split(' ')
    rows.forEach((row, ry) => {
      for (let rxp = 0; rxp < row.length; rxp++) {
        if (row[rxp] === '1') out += rect(cx + rxp, y + ry, 1, 1, fill)
      }
    })
    cx += 6
  }
  return out
}

const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

export type Meter = { name: string; pct: number | null; reset: string | null }

export const formatReset = (ms: number) => {
  const m = Math.max(0, Math.round(ms / 60000))
  if (m >= 1440) return `${Math.floor(m / 1440)}Д${Math.floor((m % 1440) / 60)}Ч`
  if (m >= 60) return `${Math.floor(m / 60)}Ч${m % 60}М`
  return `${m}М`
}

const WIN_COLS = 4
const WIN_ROWS = 5
const TOWER_W = 18
const GROUP_W = 18 + 4 + 65
const KLODIK_ZONE = 44
const GROUND = 28

const tower = (m: Meter, x0: number) => {
  let s = rect(x0, 4, TOWER_W, GROUND - 4, C.line, 3)
  s += rect(x0 + 1, 5, TOWER_W - 2, GROUND - 5, C.card, 2)
  s += `<path d="M${x0} 8V7a3 3 0 0 1 3-3h${TOWER_W - 6}a3 3 0 0 1 3 3v1z" fill="${C.coral}"/>`
  const total = WIN_COLS * WIN_ROWS
  const lit = m.pct === null ? 0 : Math.round((Math.min(m.pct, 100) / 100) * total)
  const color = m.pct === null ? C.dim : levelColor(m.pct)
  for (let r = 0; r < WIN_ROWS; r++) {
    for (let c = 0; c < WIN_COLS; c++) {
      const idx = (WIN_ROWS - 1 - r) * WIN_COLS + c
      s += rect(x0 + 2 + c * 4, 10 + r * 3.6, 2, 2, idx < lit ? color : C.dim, 0.6)
    }
  }
  const tx = x0 + TOWER_W + 4
  s += text(m.name, tx, 2, C.sub)
  const num = m.pct === null ? '--' : `${Math.round(m.pct)}%`
  s += text(num, tx, 11, m.pct === null ? C.sub : levelText(m.pct))
  if (m.reset) s += text(`СБРОС ${m.reset}`, tx, 21, C.sub)
  return s
}

const klodik = (mood: 'ok' | 'hmm' | 'alarm' | 'sleep', dx: number, dur: number) => {
  const bubbleText = { ok: 'OK', hmm: '?', alarm: '!!', sleep: 'ZZ' }[mood]
  const bubbleColor = mood === 'alarm' ? C.minusD : mood === 'hmm' ? C.warnD : C.plusD
  const bw = textWidth(bubbleText) + 6
  const bx = Math.round(7 - bw / 2)
  const walk = `<animateTransform attributeName="transform" type="translate" values="0 0;0 0;${dx} 0;${dx} 0;0 0" keyTimes="0;0.2;0.45;0.7;0.95" dur="${dur}s" repeatCount="indefinite"/>`
  const step = (begin: number) =>
    `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1;0 0" dur="0.5s" begin="${begin}s" repeatCount="indefinite"/>`
  const armY = mood === 'alarm' ? 17 : 22
  const wave = mood === 'ok'
    ? `<animate attributeName="y" values="22;18;22" dur="0.9s" repeatCount="indefinite"/>`
    : mood === 'alarm'
      ? `<animate attributeName="y" values="17;15;17" dur="0.3s" repeatCount="indefinite"/>`
      : ''
  const eyeH = mood === 'sleep' ? 1 : 4
  const blink = mood === 'sleep' ? '' : `<animate attributeName="height" values="4;4;1;4" keyTimes="0;0.9;0.95;1" dur="4s" repeatCount="indefinite"/>`
  const eye = (x: number) =>
    `<rect x="${x}" y="${mood === 'sleep' ? 22 : 20}" width="2" height="${eyeH}" rx="1" fill="${C.eye}">${blink}</rect>`
  return (
    `<g>${walk}` +
    rect(bx, 5, bw, 11, C.coral, 3) + rect(bx + 1, 6, bw - 2, 9, C.card, 2) +
    `<path d="M5.5 16h3l-1.5 2z" fill="${C.coral}"/>` +
    text(bubbleText, bx + 3, 8, bubbleColor) +
    `<g>${step(0)}${rect(1, 26, 2, 2, C.leg, 0.6)}${rect(9, 26, 2, 2, C.leg, 0.6)}</g>` +
    `<g>${step(0.25)}${rect(4, 26, 2, 2, C.leg, 0.6)}${rect(12, 26, 2, 2, C.leg, 0.6)}</g>` +
    rect(-2, armY, 2, 2, C.body, 0.8) +
    `<rect x="14" y="${armY}" width="2" height="2" rx="0.8" fill="${C.body}">${wave}</rect>` +
    rect(0, 18, 14, 9, C.body, 3) +
    eye(4) + eye(8) +
    `</g>`
  )
}

export const buildCity = (gw: number, meters: Meter[], mood: 'ok' | 'hmm' | 'alarm' | 'sleep') => {
  const W = gw * CELL
  const H = GH * CELL
  const rand = rng(gw)
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gw} ${GH}" width="${W}" height="${H}">`
  s += `<defs><clipPath id="r"><rect width="${gw}" height="${GH}" rx="9"/></clipPath></defs><g clip-path="url(#r)">`
  s += rect(0, 0, gw, GH, C.bg)
  for (let i = 0; i < Math.floor(gw / 14); i++) {
    const dur = (2 + rand() * 3).toFixed(1)
    s += `<rect x="${Math.floor(rand() * gw)}" y="${1 + Math.floor(rand() * 10)}" width="1" height="1" fill="#FAF9F5" opacity="0.3"><animate attributeName="opacity" values="0.1;0.5;0.1" dur="${dur}s" repeatCount="indefinite"/></rect>`
  }
  s += `<circle cx="${gw - 14}" cy="8" r="4" fill="${C.sun}"/><circle cx="${gw - 12}" cy="7" r="3.6" fill="${C.bg}"/>`
  for (const [color, minH, maxH] of [[C.far, 6, 14], [C.near, 4, 11]] as const) {
    let x = Math.floor(rand() * 6) - 6
    while (x < gw) {
      const w = 7 + Math.floor(rand() * 10)
      const h = minH + Math.floor(rand() * (maxH - minH))
      s += rect(x, GROUND - h, w, h + 2, color, 2)
      x += w + 2 + Math.floor(rand() * 3)
    }
  }
  s += rect(0, GROUND, gw, GH - GROUND, C.walk) + rect(0, GROUND + 2, gw, GH - GROUND - 2, C.road)
  const gap = Math.max(6, (gw - KLODIK_ZONE - 3 * GROUP_W) / 3)
  const lefts = [0, 1, 2].map(i => Math.round(KLODIK_ZONE + gap * i + GROUP_W * i))
  meters.forEach((m, i) => (s += tower(m, lefts[i])))
  s += `<g transform="translate(${Math.round(KLODIK_ZONE / 2 - 8)} 0)">${klodik(mood, 16, 12)}</g>`
  return s + '</g></svg>'
}
