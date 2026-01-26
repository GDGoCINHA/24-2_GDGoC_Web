import { forwardRef, TextareaHTMLAttributes, useState } from 'react'

/**
 * @param {'pc' | 'mobile'} device - PC 또는 Mobile 디바이스 타입
 * @param {'default' | 'active' | 'error'} status - 입력 상태 (default: 비활성, active: 활성, error: 오류)
 * @param {number} maxLength - 최대 입력 글자 수 (기본: 500)
 * @param {string} errorMessage - 오류 상태일 때 하단에 표시할 메시지
 */
interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  device?: 'pc' | 'mobile'
  status?: 'default' | 'active' | 'error'
  maxLength?: number
  errorMessage?: string
}

const DEVICE_CONFIG = {
  pc: 'w-[550px] h-[180px] text-base leading-6',
  mobile: 'w-[343px] h-[160px] text-sm leading-5'
}

const STATUS_CONFIG = {
  default: 'bg-gray-300 border-none text-gray-700',
  active: 'bg-black border border-gray-800 text-gray-700',
  error: 'bg-black border border-red text-gray-700'
}

const COUNTER_CONFIG = {
  pc: 'text-base',
  mobile: 'text-xs leading-[18px]'
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      device = 'pc',
      status = 'active',
      maxLength = 500,
      errorMessage = '※ 필수 입력 사항입니다.',
      className = '',
      value,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(0)

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      if (newValue.length <= maxLength) {
        setCharCount(newValue.length)
        onChange?.(e)
      }
    }

    const textareaClasses = `
      ${DEVICE_CONFIG[device]}
      ${STATUS_CONFIG[status]}
      px-4 py-3 rounded-xl
      font-pretendard font-medium
      placeholder-gray-700
      resize-none
      focus:outline-none
      disabled:bg-gray-500 disabled:text-gray-700 disabled:placeholder-gray-700 disabled:cursor-not-allowed
      ${className}
    `.trim().replace(/\s+/g, ' ')

    return (
      <div className={`flex flex-col ${status === 'error' ? 'gap-2' : ''} ${device === 'pc' ? 'w-[550px]' : 'w-[343px]'}`}>
        <div className={`relative ${DEVICE_CONFIG[device]} flex flex-col justify-between`}>
          <textarea
            ref={ref}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            maxLength={maxLength}
            placeholder="내용을 입력하세요."
            className={textareaClasses}
            {...props}
          />
          <div className="absolute bottom-3 right-4 text-right text-gray-700 font-pretendard font-medium pointer-events-none">
            <span className={COUNTER_CONFIG[device]}>
              ({charCount}/{maxLength})
            </span>
          </div>
        </div>
        
        {status === 'error' && (
          <div className="pl-2">
            <p className="text-red text-[11px] leading-[14px] font-pretendard font-medium">
              {errorMessage}
            </p>
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
