import { test, expect } from 'claude-code/testing'

import { classify } from './classify'
import { buildLive } from './live'

test('plain-Russian labels for tool calls', () => {
  expect(classify('Read', { file_path: '/a/b/index.html' })).toEqual({ kind: 'read', label: 'ЧИТАЮ ФАЙЛ', detail: 'index.html' })
  expect(classify('Edit', { file_path: 'x/style.css' }).label).toBe('ПРАВЛЮ ФАЙЛ')
  expect(classify('Write', { file_path: 'new.txt' }).label).toBe('ПИШУ ФАЙЛ')
  expect(classify('Bash', { command: 'npm run build' }).kind).toBe('run')
  expect(classify('mcp__DaVinci__run_script', {}).detail).toBe('run_script')
})

test('the band is an svg for every state', () => {
  for (const kind of ['idle', 'think', 'read', 'edit', 'run', 'search', 'agent', 'done', 'error']) {
    const svg = buildLive(360, { kind, label: 'ТЕСТ', detail: 'A.TXT', steps: 3, trail: ['read', 'edit'] })
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.length).toBeLessThan(131072)
  }
})
