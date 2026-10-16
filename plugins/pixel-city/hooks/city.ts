// One strip: Klodik with what Claude does now, then the limits as small towers.
import { C, CELL, GH, anim, kindColor, levelColor, rect, rng, text, textWidth } from './draw'
import type { Act } from './draw'
import { klodik } from './klodik'

export { CELL, GH, levelColor }
export type Meter = { name: string; pct: number | null; reset: string | null }

export const formatReset = (ms: number) => {
  const m = Math.max(0, Math.round(ms / 60000))
  if (m >= 1440) return `${Math.floor(m / 1440)}Д${Math.floor((m % 1440) / 60)}Ч`
  if (m >= 60) return `${Math.floor(m / 60)}Ч${m % 60}М`
  return `${m}М`
}

const WIN_COLS = 3
const WIN_ROWS = 5
const TOWER_W = 10
const GROUP_W = TOWER_W + 3 + 65
const GROUP_GAP = 4
const GROUND = 28
const STATUS_X = 50

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
      s += rect(x0 + 2 + c * 2.6, 10 + r * 3.6, 1.6, 2, idx < lit ? color : C.dim, 0.5)
    }
  }
  const tx = x0 + TOWER_W + 3
  s += text(m.name, tx, 2, C.sub)
  const num = m.pct === null ? '--' : `${Math.round(m.pct)}%`
  s += text(num, tx, 11, m.pct === null ? C.sub : levelColor(m.pct))
  if (m.reset) s += text(`СБРОС ${m.reset}`, tx, 21, C.sub)
  return s
}

export const buildCity = (gw: number, meters: Meter[], act: Act, worst: number | null) => {
  const W = gw * CELL
  const H = GH * CELL
  const rand = rng(gw + 3)
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gw} ${GH}" width="${W}" height="${H}">`
  s += `<defs><clipPath id="r"><rect width="${gw}" height="${GH}" rx="9"/></clipPath></defs><g clip-path="url(#r)">`
  s += rect(0, 0, gw, GH, C.bg)
  for (let i = 0; i < Math.floor(gw / 16); i++) {
    const dur = (2 + rand() * 3).toFixed(1)
    s += `<rect x="${Math.floor(rand() * gw)}" y="${1 + Math.floor(rand() * 12)}" width="1" height="1" fill="#FAF9F5" opacity="0.25">${anim('opacity', '0.1;0.4;0.1', `${dur}s`)}</rect>`
  }
  let x = -4
  while (x < gw) {
    const w = 7 + Math.floor(rand() * 10)
    const h = 4 + Math.floor(rand() * 9)
    s += rect(x, GROUND - h, w, h + 2, C.far, 2)
    x += w + 2 + Math.floor(rand() * 3)
  }
  s += rect(0, GROUND, gw, GH - GROUND, C.walk) + rect(0, GROUND + 2, gw, GH - GROUND - 2, C.road)

  // limits on the right
  const limW = 3 * GROUP_W + 2 * GROUP_GAP
  const limLeft = gw - limW - 8
  meters.forEach((m, i) => (s += tower(m, limLeft + i * (GROUP_W + GROUP_GAP))))
  s += rect(limLeft - 5, 4, 1, 20, C.line)

  // status on the left: Klodik, what he does, the path taken
  const statusW = limLeft - 9 - STATUS_X
  const maxChars = Math.max(4, Math.floor((statusW + 1) / 6))
  const low = act.kind === 'idle' && worst !== null && worst >= 90
  const label = (low ? 'МАЛО ЛИМИТА' : act.label).slice(0, maxChars)
  s += `<g transform="translate(6 0)">${klodik(act.kind)}</g>`
  s += text(label, STATUS_X, 4, low ? C.minus : kindColor(act.kind))
  if (act.detail) s += text(act.detail.slice(0, maxChars), STATUS_X, 14, C.sub)
  const dots = act.trail.slice(-Math.floor(statusW / 4))
  dots.forEach((k, i) => {
    const last = i === dots.length - 1
    s += `<rect x="${STATUS_X + i * 4}" y="${last ? 22.5 : 23}" width="${last ? 3 : 2}" height="${last ? 3 : 2}" rx="1" fill="${kindColor(k)}">${last ? anim('opacity', '1;0.4;1', '1s') : ''}</rect>`
  })
  return s + '</g></svg>'
}

export { textWidth }
