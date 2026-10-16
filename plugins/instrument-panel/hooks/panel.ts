// Instrument panel: a state readout on the left, three segmented gauges on the right.
import { C, CELL, GH, anim, kindColor, rect, text, textWidth, zoneColor } from './draw'
import type { Act } from './draw'

export { CELL, GH, zoneColor }
export type Meter = { name: string; pct: number | null; reset: string | null }

// 4:29 means 4 hours 29 minutes; a day or more is shown as days (1,5 = a day and a half).
export const formatReset = (ms: number) => {
  const m = Math.max(0, Math.round(ms / 60000))
  if (m >= 1440) {
    const d = Math.round((m / 1440) * 10) / 10
    return `${String(d).replace('.', ',')} ДН`
  }
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
}

// Plain machine-state words for what the agent does.
export const stateLabel = (a: Act) =>
  ({
    idle: 'ОЖИДАНИЕ', think: 'ОБРАБОТКА', read: 'ЧТЕНИЕ', edit: a.label === 'ПИШУ' ? 'ЗАПИСЬ' : 'ПРАВКА',
    run: 'ВЫПОЛНЕНИЕ', search: 'ПОИСК', agent: 'ПОДЗАДАЧА', done: 'ЗАВЕРШЕНО', error: 'СБОЙ, ПОВТОР',
  } as Record<string, string>)[a.kind] ?? a.label

const SEGS = 24
const SEG_STRIDE = 3
const BAR_W = SEGS * SEG_STRIDE - 1
const LABEL_W = 48
const GAUGE_W = LABEL_W + 4 + BAR_W + 4 + 23 + 6 + 71

const gauge = (m: Meter, x: number, y: number) => {
  let s = text(m.name, x, y, C.sub)
  const bx = x + LABEL_W + 4
  const lit = m.pct === null ? 0 : Math.round((Math.min(m.pct, 100) / 100) * SEGS)
  for (let i = 0; i < SEGS; i++) {
    const pos = ((i + 1) / SEGS) * 100
    s += rect(bx + i * SEG_STRIDE, y + 1, 2, 5, i < lit ? zoneColor(pos) : C.dim)
  }
  // zone marks under the scale: 70% and 90%
  s += rect(bx + Math.round(0.7 * SEGS) * SEG_STRIDE - 1, y + 6, 1, 2, C.warn) + rect(bx + Math.round(0.9 * SEGS) * SEG_STRIDE - 1, y + 6, 1, 2, C.minus)
  const px = bx + BAR_W + 4
  const num = m.pct === null ? '--' : `${Math.round(m.pct)}%`
  s += text(num, px, y, m.pct === null ? C.sub : zoneColor(m.pct))
  const note = m.reset ? `ЧЕРЕЗ ${m.reset}` : m.name === 'КОНТЕКСТ' ? 'ПАМЯТЬ ЧАТА' : ''
  if (note) s += text(note, px + 23 + 6, y, C.sub)
  return s
}

export const buildPanel = (gw: number, meters: Meter[], act: Act, worst: number | null) => {
  const W = gw * CELL
  const H = GH * CELL
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gw} ${GH}" width="${W}" height="${H}" shape-rendering="crispEdges">`
  s += `<defs><clipPath id="r"><rect width="${gw}" height="${GH}" rx="3"/></clipPath></defs><g clip-path="url(#r)">`
  s += rect(0, 0, gw, GH, C.bg)
  // measuring grid
  for (let gx = 4; gx < gw; gx += 8) for (let gy = 4; gy < GH; gy += 8) s += rect(gx, gy, 1, 1, C.grid)
  s += rect(0, 0, gw, 1, C.line) + rect(0, GH - 1, gw, 1, C.line)

  const gx0 = gw - GAUGE_W - 8
  const blockW = gx0 - 10
  const maxChars = Math.max(4, Math.floor((blockW - 12 + 1) / 6))

  // state readout
  const color = kindColor(act.kind)
  const low = act.kind === 'idle' && worst !== null && worst >= 90
  const head = act.steps > 0 ? `СТАТУС  ШАГ ${act.steps}` : 'СТАТУС'
  const state = low ? 'ЛИМИТ НА ИСХОДЕ' : stateLabel(act)
  s += text(head.slice(0, maxChars + 2), 6, 2, C.sub)
  const ledColor = low ? C.minus : color
  s += `<rect x="6" y="12" width="4" height="5" fill="${ledColor}">${act.kind === 'idle' && !low ? '' : anim('opacity', '1;0.35;1', act.kind === 'error' ? '0.4s' : '1.2s')}</rect>`
  s += text(state.slice(0, maxChars - 1), 13, 11, low ? C.minus : color === C.sub ? C.text : color)
  s += text((act.detail || '').slice(0, maxChars), 6, 21, C.sub)
  s += rect(gx0 - 6, 3, 1, 26, C.line)

  // gauges
  meters.forEach((m, i) => (s += gauge(m, gx0, 2 + i * 10)))
  return s + '</g></svg>'
}
