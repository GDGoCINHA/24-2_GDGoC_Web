import clsx from 'clsx'

type CheckboxVariant = 'default' | 'error'

type CheckboxProps = {
  checked?: boolean
  onChange?: (checked: boolean) => void
  className?: string
  variant?: CheckboxVariant
}

export default function Checkbox({
  checked = false,
  onChange,
  className,
  variant = 'default'
}: CheckboxProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded w-5 h-5 p-0.5 cursor-pointer transition-all'
  const uncheckedClasses = variant === 'error' ? 'border border-red' : 'border border-gray-500'
  const checkedClasses =
    variant === 'error' ? 'bg-red border border-red' : 'bg-red border border-red'

  return (
    <div
      className={clsx(baseClasses, checked ? checkedClasses : uncheckedClasses, className)}
      onClick={() => onChange?.(!checked)}
      role="checkbox"
      aria-checked={checked}
    >
      {checked && (
        <span className="block w-2.5 h-1.5 border-b-2 border-l-2 border-white -rotate-45 translate-y-px" />
      )}
    </div>
  )
}
