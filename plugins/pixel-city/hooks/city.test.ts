import { test, expect } from 'claude-code/testing'

import { buildCity, formatReset } from './city'

test('reset formats', () => {
  expect(formatReset(130 * 60000)).toBe('2Ч10М')
  expect(formatReset(30 * 60000)).toBe('30М')
  expect(formatReset((3 * 1440 + 240) * 60000)).toBe('3Д4Ч')
})

test('city is a bounded svg', () => {
  const svg = buildCity(200, [
    { name: '5H', pct: 23, reset: '2H' },
    { name: '7D', pct: null, reset: null },
    { name: 'CTX', pct: 95, reset: null },
  ], 'alarm')
  expect(svg.startsWith('<svg')).toBe(true)
  expect(svg.length).toBeLessThan(131072)
})
