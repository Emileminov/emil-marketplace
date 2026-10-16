declare module 'claude-code' {
  interface PluginState {
    'instrument-panel': {
      tick: number
      act: { kind: string; label: string; detail: string; steps: number; trail: string[] }
    }
  }
}
