import type { Act } from './live'

const base = (p: unknown) => String(p ?? '').split('/').filter(Boolean).pop() ?? ''
const short = (s: unknown, n = 40) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n)

// What Claude is doing, in plain Russian, from a tool call.
export const classify = (tool: string, input: Record<string, unknown>): Pick<Act, 'kind' | 'label' | 'detail'> => {
  switch (tool) {
    case 'Read':
    case 'NotebookRead':
      return { kind: 'read', label: 'ЧИТАЮ ФАЙЛ', detail: base(input.file_path ?? input.notebook_path) }
    case 'Write':
      return { kind: 'edit', label: 'ПИШУ ФАЙЛ', detail: base(input.file_path) }
    case 'Edit':
    case 'MultiEdit':
    case 'NotebookEdit':
      return { kind: 'edit', label: 'ПРАВЛЮ ФАЙЛ', detail: base(input.file_path ?? input.notebook_path) }
    case 'Bash':
      return { kind: 'run', label: 'ЗАПУСКАЮ КОМАНДУ', detail: short(input.command, 30) }
    case 'Grep':
      return { kind: 'search', label: 'ИЩУ В ФАЙЛАХ', detail: short(input.pattern, 30) }
    case 'Glob':
      return { kind: 'search', label: 'ИЩУ ФАЙЛЫ', detail: short(input.pattern, 30) }
    case 'WebSearch':
      return { kind: 'search', label: 'ИЩУ В ИНТЕРНЕТЕ', detail: short(input.query, 30) }
    case 'WebFetch':
      return { kind: 'search', label: 'ОТКРЫВАЮ САЙТ', detail: short(String(input.url ?? '').replace(/^https?:\/\//, ''), 30) }
    case 'Agent':
    case 'Task':
      return { kind: 'agent', label: 'ЗОВУ ПОМОЩНИКА', detail: short(input.description, 30) }
    case 'TodoWrite':
      return { kind: 'think', label: 'СОСТАВЛЯЮ ПЛАН', detail: '' }
    default:
      if (tool.startsWith('mcp__')) {
        const name = tool.split('__').pop() ?? tool
        return { kind: 'run', label: 'ИСПОЛЬЗУЮ ИНСТРУМЕНТ', detail: short(name, 30) }
      }
      return { kind: 'run', label: 'РАБОТАЮ', detail: short(tool, 30) }
  }
}
