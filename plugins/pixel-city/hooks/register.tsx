import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { classify } from './classify'
import { CELL, GH, buildCity, formatReset, levelColor } from './city'
import type { Meter } from './city'
import type { Act } from './draw'

const tick = atom({ plugin: 'pixel-city', key: 'tick' } as const, 0)
const IDLE: Act = { kind: 'idle', label: 'ЖДУ ЗАДАЧУ', detail: '', steps: 0, trail: [] }
const act = atom({ plugin: 'pixel-city', key: 'act' } as const, IDLE)

export const register: Register = on => {
  on('session.measure', async ($, e, next) => {
    await update($, tick, n => n + 1)
    return next(e)
  })

  on('session.start', async ($, e, next) => {
    await update($, act, () => IDLE)
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, act, () => ({ kind: 'think', label: 'ДУМАЮ', detail: '', steps: 0, trail: [] }))
    return next(e)
  }).catch(($, e, next) => next(e))

  on('tool.call', async ($, e, next) => {
    const now = classify(e.tool, e as unknown as Record<string, unknown>)
    await update($, act, a => ({ ...now, steps: a.steps + 1, trail: [...a.trail, now.kind].slice(-60) }))
    const ran = await next(e)
    const hasFailed = ran.deny === undefined && ran.isError === true
    await update($, act, a => ({
      ...a,
      kind: hasFailed ? 'error' : 'think',
      label: hasFailed ? 'ПРОБУЮ ИНАЧЕ' : 'ДУМАЮ',
      detail: '',
      trail: hasFailed ? [...a.trail.slice(0, -1), 'error'] : a.trail,
    }))
    return ran
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    await update($, tick, n => n + 1)
    await update($, act, a => ({
      kind: 'done',
      label: 'ГОТОВО',
      detail: a.steps > 0 ? `ШАГОВ: ${a.steps}` : '',
      steps: a.steps,
      trail: a.trail,
    }))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // a band beneath (if any other mod draws one) stays; this one stacks above it
    const below = await next(e)
    if (e.props.hasSurvey) return below

    await read($, tick)
    const a = await read($, act)
    const usage = await $.session.usage()
    const now = await $.clock.now()

    const find = (kind: string): { pct: number; reset: string | null } | null => {
      const w = usage.rateLimits.find(r => r.kind === kind)
      if (!w) return null
      return { pct: w.percentUsed, reset: w.resetsAt ? formatReset(Date.parse(w.resetsAt) - now) : null }
    }
    const five = find('five_hour')
    const week = find('seven_day')
    const ctx = usage.context.percent ?? null
    const meters: Meter[] = [
      { name: '5 ЧАСОВ', pct: five?.pct ?? null, reset: five?.reset ?? null },
      { name: 'НЕДЕЛЯ', pct: week?.pct ?? null, reset: week?.reset ?? null },
      { name: 'КОНТЕКСТ', pct: ctx, reset: null },
    ]
    const known = meters.map(m => m.pct).filter((p): p is number => p !== null)
    const worst = known.length ? Math.max(...known) : null

    if (e.surface === 'terminal') {
      const { Box, Text } = $.ui.resolve(e)
      const row = (
        <Box gap={2}>
          <Text>
            Клодик: {a.label}
            {a.detail ? ` ${a.detail}` : ''}
          </Text>
          {meters.map(m => (
            <Text key={m.name} color={m.pct === null ? undefined : levelColor(m.pct)}>
              {m.name} {m.pct === null ? '--' : `${Math.round(m.pct)}%`}
              {m.reset ? ` (${m.reset})` : ''}
            </Text>
          ))}
        </Box>
      )
      return below ? <Box flexDirection="column">{row}{below}</Box> : row
    }

    const { Box, Svg } = $.ui.resolve(e)
    const gw = Math.max(340, Math.min(700, Math.floor(e.props.bodyColumns * 4)))
    const band = (
      <Svg
        source={buildCity(gw, meters, a, worst)}
        alt={`Клодик: ${a.label} ${a.detail}. 5 часов ${meters[0].pct ?? 'нет данных'}%, неделя ${meters[1].pct ?? 'нет данных'}%, контекст ${meters[2].pct ?? 'нет данных'}%`}
        width={gw * CELL}
        height={GH * CELL}
        isInteractive
      />
    )
    return below ? <Box flexDirection="column">{band}{below}</Box> : band
  })
}
