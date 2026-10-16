import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { classify } from './classify'
import { CELL, GH, buildLive } from './live'
import type { Act } from './live'

const IDLE: Act = { kind: 'idle', label: 'ЖДУ ЗАДАЧУ', detail: '', steps: 0, trail: [] }
const act = atom({ plugin: 'klodik-live', key: 'act' } as const, IDLE)

export const register: Register = on => {
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
      label: hasFailed ? 'НЕ ВЫШЛО, ПРОБУЮ ИНАЧЕ' : 'ДУМАЮ',
      detail: '',
      trail: hasFailed ? [...a.trail.slice(0, -1), 'error'] : a.trail,
    }))
    return ran
  }).catch(($, e, next) => (next.called ? next(e) : next(e)))

  on('turn.complete', async ($, e, next) => {
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
    // another band beneath (the limits city) stays, this one stacks under it
    const below = await next(e)
    if (e.props.hasSurvey) return below

    const a = await read($, act)

    if (e.surface === 'terminal') {
      const { Box, Text } = $.ui.resolve(e)
      const line = (
        <Text>
          Клодик: {a.label}
          {a.detail ? ` ${a.detail}` : ''}
          {a.steps ? ` (шаг ${a.steps})` : ''}
        </Text>
      )
      return below ? <Box flexDirection="column">{below}{line}</Box> : line
    }

    const { Box, Svg } = $.ui.resolve(e)
    const gw = Math.max(330, Math.min(700, Math.floor(e.props.bodyColumns * 4)))
    const band = (
      <Svg
        source={buildLive(gw, a)}
        alt={`Клодик: ${a.label} ${a.detail}`}
        width={gw * CELL}
        height={GH * CELL}
        isInteractive
      />
    )
    return below ? <Box flexDirection="column">{below}{band}</Box> : band
  })
}
