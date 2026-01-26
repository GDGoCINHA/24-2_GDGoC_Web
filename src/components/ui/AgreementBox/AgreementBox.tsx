import clsx from 'clsx'
import Checkbox from '@/components/ui/Checkbox/Checkbox'

type AgreementBoxDevice = 'pc' | 'mobile'
type AgreementBoxStatus = 'unchecked' | 'checked' | 'error'

type AgreementBoxProps = {
  checked?: boolean
  status?: AgreementBoxStatus
  device?: AgreementBoxDevice
  onChange?: (checked: boolean) => void
  label?: string
  errorMessage?: string
  className?: string
}

export default function AgreementBox({
  checked = false,
  status = 'unchecked',
  device = 'pc',
  onChange,
  label = '동의합니다.',
  errorMessage = '*오류메세지',
  className
}: AgreementBoxProps) {
  const isError = status === 'error'
  const isChecked = status === 'checked' ? true : checked

  const containerClasses = clsx('flex flex-col gap-1', className)
  const rowClasses = clsx(
    'flex items-center gap-2',
    device === 'mobile' ? 'items-center' : 'items-center'
  )
  const labelClasses = 'font-medium not-italic text-sm leading-5 text-white'
  const errorClasses = 'text-xs leading-4 text-red'

  return (
    <div className={containerClasses}>
      <div className={rowClasses}>
        <p className={labelClasses}>{label}</p>
        <Checkbox checked={isChecked} onChange={onChange} variant={isError ? 'error' : 'default'} />
      </div>

      {isError && <p className={errorClasses}>{errorMessage}</p>}
    </div>
  )
}
