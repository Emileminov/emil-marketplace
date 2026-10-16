import { test, expect } from 'claude-code/testing'

import { buildCity, formatReset } from './city'

test('reset formats', () => {
  expect(formatReset(130 * 60000)).toBe('2Ч10М')
  expect(formatReset(30 * 60000)).toBe('30М')
  expect(formatReset((3 * 1440 + 240) * 60000)).toBe('3Д4Ч')
})

test('one strip is a bounded svg for every state', () => {
  const meters = [
    { name: '5 ЧАСОВ', pct: 23, reset: '4Ч29М' },
    { name: 'НЕДЕЛЯ', pct: null, reset: null },
    { name: 'КОНТЕКСТ', pct: 95, reset: null },
  ]
  for (const kind of ['idle', 'think', 'read', 'edit', 'run', 'search', 'agent', 'done', 'error']) {
    const svg = buildCity(360, meters, { kind, label: 'ТЕСТ', detail: 'A.TXT', steps: 3, trail: ['read', 'edit'] }, 95)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.length).toBeLessThan(131072)
  }
})
