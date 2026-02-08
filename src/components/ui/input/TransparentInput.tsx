'use client'

import { GdgInput } from '@/components/ui/input/GdgInput';

const TransparentInput = ({
  label,
  isRequired = false,
  placeholder = "",
  type = "text",
  name,
  value,
  onChange,
  className = "",
  autoComplete,
  inputMode,
  isDisabled,
}) => {
  return (
    <GdgInput
      isDisabled={isDisabled}
      isRequired={isRequired}
      autoComplete={autoComplete ? 'on' : 'off'}
      className={`mobile:!mt-[45px] w-full rounded-full ${className}`}
      label={label}
      labelPlacement='outside'
      name={name}
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
      inputMode={inputMode}
    />
  );
};

export default TransparentInput;