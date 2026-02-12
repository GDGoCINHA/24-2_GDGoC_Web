'use client'

const NESTED_KEYS = ['data', 'result', 'payload', 'content']

type TokenCarrier = unknown

const toRecord = (input: unknown): Record<string, unknown> | null =>
  typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : null

const pickToken = (carrier: TokenCarrier, keys: string[]): string | undefined => {
  const record = toRecord(carrier)
  if (!record) {
    return undefined
  }

  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }

  for (const nestedKey of NESTED_KEYS) {
    const nestedValue = record[nestedKey]
    const nestedToken = pickToken(nestedValue, keys)
    if (nestedToken) {
      return nestedToken
    }
  }

  return undefined
}

export const extractAccessToken = (carrier: TokenCarrier): string | undefined =>
  pickToken(carrier, ['accessToken', 'access_token'])
