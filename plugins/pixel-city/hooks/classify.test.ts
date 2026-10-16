import { test, expect } from 'claude-code/testing'

import { classify } from './classify'

test('plain-Russian labels for tool calls', () => {
  expect(classify('Read', { file_path: '/a/b/index.html' })).toEqual({ kind: 'read', label: 'ЧИТАЮ', detail: 'index.html' })
  expect(classify('Edit', { file_path: 'x/style.css' }).label).toBe('ПРАВЛЮ')
  expect(classify('Write', { file_path: 'new.txt' }).label).toBe('ПИШУ')
  expect(classify('Bash', { command: 'npm run build' }).kind).toBe('run')
  expect(classify('mcp__DaVinci__run_script', {}).detail).toBe('run_script')
})

