export {}

declare global {
  interface Window {
    TypeHangul?: {
      type: (selector: string, options: Record<string, unknown>) => void
    }
  }
}
