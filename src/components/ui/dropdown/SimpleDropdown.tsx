import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

const DROPDOWN_ARROW_ICON = '/icons/ui/dropdown-arrow.svg'

/**
 * @param {'pc' | 'mobile'} device - PC 또는 Mobile 디바이스 타입
 * @param {'mini' | 'small' | 'full'} size - 드롭박스 크기
 * @param {Array<{key: string, value: string}>} options - 드롭다운 옵션
 * @param {string} value - 선택된 값
 * @param {(value: string) => void} onChange - 값 변경 시 호출되는 콜백
 */
interface SimpleDropdownProps {
  device?: 'pc' | 'mobile'
  size?: 'mini' | 'small' | 'full'
  options: Array<{ key: string; value: string }>
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const DEVICE_SIZE_CONFIG = {
  pc: {
    mini: 'w-[136px]',
    small: 'w-[123px]',
    full: 'w-[551px]'
  },
  mobile: {
    mini: 'w-[136px]',
    small: 'w-[109px]',
    full: 'w-[343px]'
  }
}

const TEXT_CONFIG = {
  pc: {
    mini: 'text-base leading-6',
    small: 'text-base leading-6',
    full: 'text-base leading-6'
  },
  mobile: {
    mini: 'text-sm leading-5',
    small: 'text-sm leading-5',
    full: 'text-sm leading-5'
  }
}

const SimpleDropdown = ({
  device = 'pc',
  size = 'small',
  options,
  value = '',
  onChange,
  placeholder = '선택하기',
  disabled = false
}: SimpleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue)
    onChange?.(optionValue)
    setIsOpen(false)
  }

  const selectedLabel = options.find((opt) => opt.value === selectedValue)?.key || placeholder
  const sizeClass = DEVICE_SIZE_CONFIG[device][size]
  const textClass = TEXT_CONFIG[device][size]

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          ${sizeClass}
          bg-black border border-gray-800 text-gray-700
          px-4 py-2
          rounded-full
          font-pretendard font-medium ${textClass}
          flex items-center justify-between gap-4
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:border-gray-700 transition-colors
        `
          .trim()
          .replace(/\s+/g, ' ')}
      >
        <span className="truncate flex-1 text-left">{selectedLabel}</span>
        <Image
          src={DROPDOWN_ARROW_ICON}
          alt="dropdown"
          width={12}
          height={12}
          className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`
            ${sizeClass}
            absolute top-full left-0 z-50 mt-2
            bg-gray-100 rounded-2xl
            border border-gray-200
            max-h-48 overflow-y-auto
            shadow-lg
          `
            .trim()
            .replace(/\s+/g, ' ')}
        >
          {options.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-4 py-2.5
                text-left
                font-pretendard font-medium ${textClass}
                ${selectedValue === option.value ? 'bg-white text-black' : 'bg-gray-100 text-white'}
                hover:bg-white hover:text-black transition-colors
                ${index === options.length - 1 ? 'rounded-b-2xl' : ''}
                flex items-center justify-between
              `
                .trim()
                .replace(/\s+/g, ' ')}
            >
              <span className="truncate">{option.key}</span>
              {selectedValue === option.value && (
                <Image
                  src="/icons/ui/check-icon.svg"
                  alt="selected"
                  width={16}
                  height={16}
                  className="shrink-0 ml-2"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SimpleDropdown
