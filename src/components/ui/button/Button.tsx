import clsx from 'clsx'
import type { ReactNode } from 'react'

type ButtonSize = 'large' | 'small'

type ButtonProps = {
  children?: ReactNode
  size?: ButtonSize
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const SIZE_CONFIG: Record<ButtonSize, string> = {
  large: 'min-w-[460px] px-[216px] py-[14px]',
  small: 'min-w-[122px] px-12 py-[14px]'
}

export default function Button({
  children,
  size = 'small',
  onClick,
  className,
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const sizeClasses = SIZE_CONFIG[size]

  const buttonClasses = clsx(
    'inline-flex items-center justify-center rounded-full font-medium text-base leading-6 text-white',
    'h-14 transition-all duration-200',
    'bg-gray-200 hover:bg-gray-300 active:bg-red-glass active:border-[1.5px] active:border-red',
    'disabled:bg-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-500',
    sizeClasses,
    className
  )

  return (
    <button className={buttonClasses} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  )
}
