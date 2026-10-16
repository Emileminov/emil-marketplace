declare module 'claude-code' {
  interface PluginState {
    'klodik-live': {
      act: { kind: string; label: string; detail: string; steps: number; trail: string[] }
    }
  }
}
