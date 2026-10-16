import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { CELL, GH, buildCity, formatReset, levelText } from './city'
import type { Meter } from './city'

const tick = atom({ plugin: 'pixel-city', key: 'tick' } as const, 0)

export const register: Register = on => {
  on('session.measure', async ($, e, next) => {
    await update($, tick, n => n + 1)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await update($, tick, n => n + 1)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    await read($, tick)
    const usage = await $.session.usage()
    const now = await $.clock.now()

    const find = (kind: string): { pct: number; reset: string | null } | null => {
      const w = usage.rateLimits.find(r => r.kind === kind)
      if (!w) return null
      const reset = w.resetsAt ? formatReset(Date.parse(w.resetsAt) - now) : null
      return { pct: w.percentUsed, reset }
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
    const mood = worst === null ? 'sleep' : worst >= 90 ? 'alarm' : worst >= 70 ? 'hmm' : 'ok'

    if (e.surface === 'terminal') {
      const { Box, Text } = $.ui.resolve(e)
      return (
        <Box gap={2}>
          {meters.map(m => (
            <Text key={m.name} color={m.pct === null ? undefined : levelText(m.pct)}>
              {m.name} {m.pct === null ? '--' : `${Math.round(m.pct)}%`}
              {m.reset ? ` (${m.reset})` : ''}
            </Text>
          ))}
        </Box>
      )
    }

    const { Svg } = $.ui.resolve(e)
    const gw = Math.max(330, Math.min(700, Math.floor(e.props.bodyColumns * 4)))
    const width = gw * CELL
    const height = GH * CELL

    return (
      <Svg
        source={buildCity(gw, meters, mood)}
        alt={`Pixel city: 5h ${meters[0].pct ?? 'n/a'}%, week ${meters[1].pct ?? 'n/a'}%, context ${meters[2].pct ?? 'n/a'}%`}
        width={width}
        height={height}
        isInteractive
      />
    )
  })
}
