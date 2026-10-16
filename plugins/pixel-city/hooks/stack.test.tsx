import { test, expect } from 'claude-code/testing'

test('city keeps a band beneath and stacks above it', async ($, on) => {
  on('clock.now', (() => ({ value: 1_000_000 })) as any)
  on('session.usage', (() => ({
    value: {
      startedAt: 0,
      context: { percent: 40 },
      rateLimits: [{ kind: 'five_hour', percentUsed: 23 }],
    },
  })) as any)
  on('ui.render', { component: 'AbovePrompt' }, ($$, e) => {
    const { Box, Text } = $$.ui.resolve(e)
    return (
      <Box>
        <Text>commentator</Text>
      </Box>
    )
  })
  const view = await $.ui.mount({
    plugin: 'pixel-city',
    surface: 'desktop',
    component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 120 },
  })
  const v: any = view
  const dump = JSON.stringify(typeof v.drawn === 'function' ? await v.drawn() : v.drawn)
  expect(dump).toContain('commentator')
  expect(dump).toContain('Svg')
})
