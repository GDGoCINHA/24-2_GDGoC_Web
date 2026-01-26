import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

const DROPDOWN_ARROW_ICON = '/icons/ui/dropdown-arrow.svg'

/**
 * @param {'pc' | 'mobile'} device - PC 또는 Mobile 디바이스 타입
 * @param {Array<{title: string, items: Array<{key: string, value: string}>}>} groups - 그룹화된 옵션
 * @param {string} value - 선택된 값
 * @param {(value: string) => void} onChange - 값 변경 시 호출되는 콜백
 */
interface GroupedDropdownProps {
  device?: 'pc' | 'mobile'
  groups: Array<{
    title: string
    items: Array<{ key: string; value: string }>
  }>
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const DEVICE_CONFIG = {
  pc: {
    width: 'w-[551px]',
    height: 'h-[322px]',
    textSize: 'text-base leading-6',
    captionSize: 'text-xs leading-[18px]'
  },
  mobile: {
    width: 'w-[343px]',
    height: 'h-[300px]',
    textSize: 'text-sm leading-5',
    captionSize: 'text-xs leading-[18px]'
  }
}

const GroupedDropdown = ({
  device = 'pc',
  groups,
  value = '',
  onChange,
  placeholder = '선택하기',
  disabled = false
}: GroupedDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const config = DEVICE_CONFIG[device]

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

  // 선택된 항목 찾기
  let selectedLabel = placeholder
  for (const group of groups) {
    const found = group.items.find((item) => item.value === selectedValue)
    if (found) {
      selectedLabel = found.key
      break
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          ${config.width}
          bg-black border border-gray-800 text-gray-700
          px-4 py-2
          rounded-full
          font-pretendard font-medium ${config.textSize}
          flex items-center justify-between gap-4
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:border-gray-700 transition-colors
        `.trim().replace(/\s+/g, ' ')}
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
            ${config.width}
            ${config.height}
            absolute top-full left-0 z-50 mt-1
            bg-gray-100 rounded-2xl
            border border-gray-200
            overflow-y-auto
            shadow-lg
            p-4
          `.trim().replace(/\s+/g, ' ')}
        >
          <div className="space-y-4">
            {groups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* 목차 제목 */}
                <p className={`font-pretendard font-medium ${config.captionSize} text-gray-600 mb-2`}>
                  {group.title}
                </p>

                {/* 그룹 항목들 */}
                <div className="space-y-1">
                  {group.items.map((item, itemIndex) => (
                    <button
                      key={`${item.value}-${groupIndex}-${itemIndex}`}
                      type="button"
                      onClick={() => handleSelect(item.value)}
                      className={`
                        w-full px-2 py-2
                        text-left
                        font-pretendard font-medium ${config.textSize}
                        rounded-lg transition-colors
                        flex items-center justify-between
                        ${
                          selectedValue === item.value
                            ? 'bg-white text-black'
                            : 'bg-gray-100 text-white hover:bg-white hover:text-black'
                        }
                      `.trim().replace(/\s+/g, ' ')}
                    >
                      <span className="truncate">{item.key}</span>
                      {selectedValue === item.value && (
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

                {groupIndex < groups.length - 1 && <div className="h-px bg-gray-200 my-3" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupedDropdown
