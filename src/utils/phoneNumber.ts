export const PHONE_NUMBER_PATTERN = /^010-\d{4}-\d{4}$/

export const toPhoneDigits = (value: string): string => value.replace(/\D/g, '')

export const formatPhoneNumberInput = (value: string): string => {
  const sanitized = value.replace(/[^0-9-]/g, '')
  const digits = sanitized.replace(/-/g, '').slice(0, 11)

  let formatted = digits
  if (digits.length > 3) {
    formatted = `${digits.slice(0, 3)}-${digits.slice(3, Math.min(digits.length, 7))}`
  }
  if (digits.length > 7) {
    formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  // Allow manual "-" while typing at valid boundaries.
  if (sanitized.endsWith('-')) {
    if (digits.length === 3) return `${digits}-`
    if (digits.length >= 4 && digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}-`
    }
  }

  return formatted
}

export const isPhoneNumberFormatValid = (value: string): boolean =>
  PHONE_NUMBER_PATTERN.test(value.trim())
