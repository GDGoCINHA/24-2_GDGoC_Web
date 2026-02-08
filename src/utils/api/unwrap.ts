const WRAPPER_KEYS = ['data', 'result', 'payload', 'content'] as const

type WrapperKey = (typeof WRAPPER_KEYS)[number]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const unwrapApiResponse = <T>(payload: unknown): T => {
  let current: unknown = payload

  while (isRecord(current)) {
    let unwrapped = false
    for (const key of WRAPPER_KEYS) {
      if (key in current && current[key as WrapperKey] !== undefined) {
        current = current[key as WrapperKey]
        unwrapped = true
        break
      }
    }

    if (!unwrapped) {
      break
    }
  }

  return current as T
}
