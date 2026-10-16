declare module 'claude-code' {
  interface PluginState {
    'pixel-city': {
      tick: number
      act: { kind: string; label: string; detail: string; steps: number; trail: string[] }
    }
  }
}
