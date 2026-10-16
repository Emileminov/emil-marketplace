import { test, expect } from 'claude-code/testing'

test('keeps the band beneath and adds its own', async ($, on) => {
  on('ui.render', { component: 'AbovePrompt' }, ($$, e) => {
    const { Box, Text } = $$.ui.resolve(e)
    return (
      <Box>
        <Text>city</Text>
      </Box>
    )
  })
  const view = await $.ui.mount({
    plugin: 'klodik-live',
    surface: 'desktop',
    component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 120 },
  })
  const v: any = view
  const tree = typeof v.drawn === 'function' ? await v.drawn() : v.drawn
  const dump = JSON.stringify(tree)
  expect(dump).toContain('city')
  expect(dump).toContain('Svg')
})
