import { useCallback } from 'react'

import {
  formatPhoneNumberInput,
  isPhoneNumberFormatValid,
  toPhoneDigits
} from '@/utils/phoneNumber'

export const usePhoneNumber = () => {
  const formatInput = useCallback((value: string) => formatPhoneNumberInput(value), [])
  const toDigits = useCallback((value: string) => toPhoneDigits(value), [])
  const isValidFormat = useCallback((value: string) => isPhoneNumberFormatValid(value), [])

  return {
    formatInput,
    toDigits,
    isValidFormat
  }
}
