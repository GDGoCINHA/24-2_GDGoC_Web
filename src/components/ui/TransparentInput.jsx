'use client'

import { Input } from '@nextui-org/react';

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
    <Input
      isDisabled={isDisabled}
      isRequired={isRequired}
      autoComplete={autoComplete ? 'on' : 'off'}
      className={`mobile:!mt-[45px] w-full rounded-full ${className}`}
      classNames={{
        label: '!pb-[10px] !text-white',
        inputWrapper: `h-[48px] mobile:h-[44px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
        group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
        group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent
        group-data-[invalid=true]:!bg-transparent group-data-[invalid=true]:!border-[#EA4336]`,
        mainWrapper: 'relative',
        helperWrapper: 'absolute -bottom-6 left-0',
        input: '!text-white',
        errorMessage: 'mobile:!text-[11px] text-[#EA4336]',
      }}
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