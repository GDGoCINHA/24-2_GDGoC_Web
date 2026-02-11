export const formatDateInput = (value: string): string => {
  const sanitized = value.replace(/[^0-9.]/g, '')
  const digits = sanitized.replace(/\./g, '').slice(0, 8)

  let formatted = digits
  if (digits.length > 4) {
    formatted = `${digits.slice(0, 4)}.${digits.slice(4, Math.min(digits.length, 6))}`
  }
  if (digits.length > 6) {
    formatted = `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`
  }

  // Allow manual "." while typing at valid boundaries.
  if (sanitized.endsWith('.')) {
    if (digits.length === 4) return `${digits}.`
    if (digits.length >= 5 && digits.length <= 6) {
      return `${digits.slice(0, 4)}.${digits.slice(4)}.`
    }
  }

  return formatted
}
