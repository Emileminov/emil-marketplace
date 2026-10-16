import { C, anim, rect as softRect, text } from './draw'

// Klodik is pure pixel art: every shape sits on the 1-unit grid, no rounded corners.
const rect = (x: number, y: number, w: number, h: number, fill: string, _rx = 0, extra = '') => softRect(x, y, w, h, fill, 0, extra)

const frame = (x: number, y: number, w: number, h: number, fill: string, edge: string) =>
  rect(x + 1, y, w - 2, h, edge) + rect(x, y + 1, w, h - 2, edge) + rect(x + 1, y + 1, w - 2, h - 2, fill)

const plus = (x: number, y: number, fill: string, begin: number) =>
  `<g fill="${fill}">${anim('opacity', '0;1;0', '1.1s', ` begin="${begin}s"`)}${rect(x, y - 2, 1, 5, fill)}${rect(x - 2, y, 5, 1, fill)}</g>`

// Klodik at origin (0..14 wide, standing on y=28), plus the prop for what he is doing.
export const klodik = (kind: string) => {
  const armR = kind === 'done'
    ? `<rect x="14" y="14" width="2" height="6" fill="${C.body}">${anim('y', '14;12;14', '0.5s')}</rect>`
    : kind === 'edit'
      ? `<rect x="14" y="21" width="2" height="2" fill="${C.body}">${anim('y', '21;24;21', '0.22s')}</rect>`
      : rect(14, 21, 2, 2, C.body)
  const armL = kind === 'done'
    ? `<rect x="-2" y="14" width="2" height="6" fill="${C.body}">${anim('y', '14;12;14', '0.5s', ' begin="0.25s"')}</rect>`
    : rect(-2, 21, 2, 2, C.body)
  const eyeH = kind === 'idle' ? 1 : 4
  const eyeY = kind === 'idle' ? 21 : 19
  const look = kind === 'read' || kind === 'edit' || kind === 'run' || kind === 'search' ? 1 : 0
  const eye = (x: number) =>
    `<rect x="${x + look}" y="${eyeY}" width="2" height="${eyeH}" fill="${C.eye}">${kind === 'idle' ? '' : anim('height', '4;4;1;4', '4s', ' keyTimes="0;0.9;0.95;1"')}</rect>`
  const walk = (b: number) =>
    `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1;0 0" dur="0.5s" begin="${b}s" repeatCount="indefinite"/>`
  const leg = (x: number) => rect(x, 27, 2, 2, C.leg)
  const legs = kind === 'search' || kind === 'agent'
    ? `<g>${walk(0)}${leg(1)}${leg(9)}</g><g>${walk(0.25)}${leg(4)}${leg(12)}</g>`
    : [1, 4, 9, 12].map(leg).join('')
  const shake = kind === 'error'
    ? `<animateTransform attributeName="transform" type="translate" values="0 0;-1 0;1 0;0 0" dur="0.3s" repeatCount="indefinite"/>`
    : ''
  // body: 14 x 9 with the four corner pixels cut off
  const body = rect(1, 17, 12, 1, C.body) + rect(0, 18, 14, 7, C.body) + rect(1, 25, 12, 1, C.body)

  let prop = ''
  if (kind === 'read') {
    prop = frame(20, 12, 13, 16, C.card, C.line) +
      [15, 18, 21, 24].map(y => rect(22, y, 9, 1, C.dim)).join('') +
      `<rect x="21" y="14" width="11" height="1" fill="${C.coral}">${anim('y', '14;25;14', '1.8s')}</rect>`
  } else if (kind === 'edit') {
    prop = frame(18, 16, 15, 10, C.card, C.line) +
      [0, 1, 2].map(i => `<rect x="20" y="${18 + i * 2}" width="${8 + (i % 2) * 3}" height="1" fill="${C.coral}">${anim('opacity', '0.2;1;0.2', '1.2s', ` begin="${i * 0.3}s"`)}</rect>`).join('') +
      rect(16, 26, 19, 2, C.line)
  } else if (kind === 'run') {
    prop = frame(18, 13, 19, 15, C.term, C.line) + rect(19, 14, 17, 2, C.line) +
      rect(21, 19, 1, 1, C.warn) + rect(22, 20, 1, 1, C.warn) + rect(21, 21, 1, 1, C.warn) +
      `<rect x="25" y="21" width="4" height="1" fill="${C.warn}">${anim('opacity', '1;0;1', '1s')}</rect>` +
      rect(21, 24, 9, 1, C.dim)
  } else if (kind === 'search') {
    const ring = rect(24, 15, 4, 1, C.plus) + rect(24, 21, 4, 1, C.plus) + rect(23, 16, 1, 5, C.plus) + rect(28, 16, 1, 5, C.plus)
    const handle = [0, 1, 2, 3].map(i => rect(29 + i, 22 + i, 1, 1, C.plus) + rect(29 + i, 23 + i, 1, 1, C.plus)).join('')
    prop = `<g><animateTransform attributeName="transform" type="translate" values="0 0;10 0;0 0" dur="2.4s" repeatCount="indefinite"/>${ring}${handle}</g>`
  } else if (kind === 'agent') {
    prop = `<g>${rect(23, 21, 8, 1, C.body)}${rect(22, 22, 10, 4, C.body)}${rect(23, 26, 8, 1, C.body)}${rect(24, 23, 1, 2, C.eye)}${rect(29, 23, 1, 2, C.eye)}` +
      rect(23, 27, 1, 1, C.leg) + rect(30, 27, 1, 1, C.leg) +
      `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1;0 0" dur="0.6s" repeatCount="indefinite"/></g>`
  } else if (kind === 'think') {
    prop = frame(-1, 3, 17, 10, C.card, C.line) +
      [0, 1, 2].map(i => `<rect x="${3 + i * 4}" y="7" width="2" height="2" fill="${C.text}">${anim('opacity', '0.2;1;0.2', '1.2s', ` begin="${i * 0.25}s"`)}</rect>`).join('') +
      rect(5, 13, 3, 1, C.line) + rect(6, 14, 1, 1, C.line)
  } else if (kind === 'done') {
    prop = [[22, 12, 0], [28, 20, 0.35], [-2, 12, 0.7]].map(([x, y, b]) => plus(x, y, C.warn, b)).join('')
  } else if (kind === 'error') {
    prop = rect(3, 4, 10, 10, C.minus) + rect(4, 3, 8, 1, C.minus) + rect(4, 14, 8, 1, C.minus) + text('!', 6, 5, C.bg)
  } else if (kind === 'idle') {
    prop = [0, 1].map(i => `<g opacity="0">${anim('opacity', '0;0.8;0', '2.4s', ` begin="${i * 1.2}s"`)}<animateTransform attributeName="transform" type="translate" values="0 6;0 0" dur="2.4s" begin="${i * 1.2}s" repeatCount="indefinite"/>${text('Z', 17 + i * 5, 8 - i * 3, C.sub)}</g>`).join('')
  }
  // everything but the props lifts one unit so the legs stand on the ground line
  return `<g>${shake}<g transform="translate(0 -1)">${legs}${armL}${armR}${body}${eye(4)}${eye(8)}</g>${prop}</g>`
}
