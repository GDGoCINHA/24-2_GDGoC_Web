import clsx from 'clsx'
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

type InputDevice = 'pc' | 'mobile'
type InputSize = 'mini' | 'small' | 'medium' | '2/3' | 'full'
type InputStatus = 'default' | 'active' | 'error'

/**
 * Input 컴포넌트의 Props 인터페이스
 * @interface InputProps
 */
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 기기 타입 (선택값: 'pc' | 'mobile') */
  device?: InputDevice
  /** 입력 필드의 크기 (선택값: 'mini' | 'small' | 'medium' | '2/3' | 'full') */
  size?: InputSize
  /** 입력 필드의 상태 (선택값: 'default' | 'active' | 'error') */
  status?: InputStatus
  /** 에러 메시지 (status='error'일 때 표시됨) */
  error?: ReactNode
}

const SIZE_CONFIG: Record<InputDevice, Record<InputSize, string>> = {
  pc: {
    mini: 'w-34 h-6.5 px-3 py-2.5 text-xs gap-4',
    small: 'w-30.5 h-11 px-4 py-2.5 text-base gap-4',
    medium: 'w-66.25 h-11 px-4 py-2 text-base gap-4',
    '2/3': 'w-102 h-11 px-4 py-2 text-base gap-4',
    full: 'w-137.5 h-11 px-4 py-2 text-base gap-4'
  },
  mobile: {
    mini: 'w-34 h-11 px-4 py-2.5 text-xs gap-4',
    small: 'w-27.25 h-11 px-4 py-2.5 text-sm gap-2',
    medium: 'w-42 h-11 px-4 py-2.5 text-sm gap-4',
    '2/3': 'w-56.5 h-11 px-4 py-2.5 text-sm gap-4',
    full: 'w-85.75 h-11 px-4 py-2.5 text-sm gap-4'
  }
}

const STATUS_CONFIG: Record<InputStatus, string> = {
  default: 'bg-gray-300 text-gray-900 placeholder-gray-900',
  active: 'bg-black border border-gray-800 text-gray-900 placeholder-gray-700',
  error: 'bg-black border border-red text-gray-900 placeholder-gray-700'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ device = 'pc', size = 'small', status = 'default', error, className, ...props }, ref) => {
    const sizeClasses = SIZE_CONFIG[device][size]
    const statusClasses = STATUS_CONFIG[status]
    const isError = status === 'error' || !!error

    const inputClasses = clsx(
      'inline-flex items-center rounded-full font-medium transition-all',
      'placeholder:text-gray-700 disabled:bg-gray-500 disabled:text-gray-700 disabled:placeholder-gray-700 disabled:cursor-not-allowed',
      sizeClasses,
      statusClasses,
      className
    )

    const wrapperClasses = clsx('flex flex-col', isError ? 'gap-2' : '')

    if (isError) {
      return (
        <div className={wrapperClasses}>
          <input ref={ref} className={inputClasses} {...props} />
          <p className="text-xs leading-3.5 text-red pl-2">※ 필수 입력 사항입니다.</p>
        </div>
      )
    }

    return <input ref={ref} className={inputClasses} {...props} />
  }
)

Input.displayName = 'Input'

export default Input
