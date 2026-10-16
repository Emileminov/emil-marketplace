import { C, anim, rect, text } from './draw'

// Klodik at origin (0..14 wide, standing on y=28), plus the prop for what he is doing.
export const klodik = (kind: string) => {
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
    prop = [[22, 12], [28, 20], [-2, 12]].map(([x, y], i) =>
      `<path d="M${x} ${y - 3}v6M${x - 3} ${y}h6" stroke="${C.warn}" stroke-width="1.4" stroke-linecap="round">${anim('opacity', '0;1;0', '1.1s', ` begin="${i * 0.35}s"`)}</path>`).join('')
  } else if (kind === 'error') {
    prop = rect(4, 3, 8, 12, C.minus, 3) + text('!', 7, 5, C.bg)
  } else if (kind === 'idle') {
    prop = [0, 1].map(i => `<g opacity="0">${anim('opacity', '0;0.8;0', '2.4s', ` begin="${i * 1.2}s"`)}<animateTransform attributeName="transform" type="translate" values="0 6;0 0" dur="2.4s" begin="${i * 1.2}s" repeatCount="indefinite"/>${text('Z', 17 + i * 5, 8 - i * 3, C.sub)}</g>`).join('')
  }
  return `<g>${shake}${legs}${armL}${armR}${rect(0, 18, 14, 9, C.body, 3)}${eye(4)}${eye(8)}${prop}</g>`
}

