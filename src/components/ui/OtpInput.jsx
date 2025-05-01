// OtpInput.jsx
import React from 'react';
import { Button, InputOtp, Form } from '@nextui-org/react';

export default function OtpInput({ setOtp, label, isDisabled, onSubmitOtp, isOtpVerified }) {
  return (
    <>
      <p className='text-white text-sm mt-[5px] mb-[-15px] ml-[2px] mobile:text-sm'>{label}</p>
      <Form
        className='flex w-full flex-row items-start gap-2'
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const otpValue = formData.get('otp');
          setOtp(otpValue);
          if (onSubmitOtp) onSubmitOtp(otpValue);
        }}
      >
        <InputOtp
          isDisabled={isDisabled}
          className='dark text-white'
          color={isOtpVerified ? 'success' : 'default'}
          isRequired
          variant='bordered'
          aria-label='OTP input field'
          length={6}
          name='otp'
          placeholder='Enter code'
        />
        <Button
          isDisabled={isDisabled}
          className={`w-[75px] h-[40px] min-w-[50px] mt-[8px] p-0 text-sm rounded-xl !bg-transparent border-2 ${
            isOtpVerified ? 'border-green-500/50 text-green-500' : 'border-white/50 text-white'
          }`}
          size='sm'
          type='submit'
          variant='bordered'
        >
          제출
        </Button>
      </Form>
    </>
  );
}