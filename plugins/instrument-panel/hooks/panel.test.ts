import { test, expect } from 'claude-code/testing'

import { buildPanel, formatReset } from './panel'
import { classify } from './classify'

test('reset formats', () => {
  expect(formatReset(130 * 60000)).toBe('2:10')
  expect(formatReset(30 * 60000)).toBe('0:30')
  expect(formatReset((3 * 1440 + 240) * 60000)).toBe('3,2 ДН')
})

test('tool calls map to plain states', () => {
  expect(classify('Read', { file_path: '/a/b/index.html' }).detail).toBe('index.html')
  expect(classify('Bash', { command: 'npm run build' }).kind).toBe('run')
})

test('the panel is a bounded svg for every state', () => {
  const meters = [
    { name: '5 ЧАСОВ', pct: 23, reset: '4:29' },
    { name: 'НЕДЕЛЯ', pct: null, reset: null },
    { name: 'КОНТЕКСТ', pct: 95, reset: null },
  ]
  for (const kind of ['idle', 'think', 'read', 'edit', 'run', 'search', 'agent', 'done', 'error']) {
    const svg = buildPanel(380, meters, { kind, label: 'ТЕСТ', detail: 'A.TXT', steps: 3, trail: [] }, 95)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.length).toBeLessThan(131072)
  }
})
