'use client'

import { useState } from 'react';
import { Button } from '@nextui-org/react';
import TransparentInput from '@/components/ui/TransparentInput';
import OtpInput from '@/components/ui/OtpInput';
import axios from 'axios';

export default function AuthResetRequest({ handleNextStep, handleBackToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpDisabled, setIsOtpDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const handleSendOtp = async () => {
    alert(`${email}로 인증번호 전송이 완료되었습니다.`);
    setIsOtpDisabled(false);
    // try {
    //   const response = await axios.post('/api/send-otp', { name, email });
    //   if (response.status === 200) {
    //     setIsOtpDisabled(false);
    //   }
    // } catch (error) {
    //   alert('존재하지 않거나 옳지 않은 정보입니다');
    // }
  };

  const handleVerifyOtp = async (submittedOtp) => {
    alert('인증이 완료되었습니다.');
    setIsNextDisabled(false);
    setIsOtpDisabled(true);
    // try {
    //   const response = await axios.post('/api/verify-otp', {
    //     email,
    //     otp: submittedOtp,
    //   });
    //   if (response.status === 200) {
    //         setIsNextDisabled(false);
    //         setIsOtpDisabled(true);
    //         alert('인증이 완료되었습니다.')
    //   } else {
    //     alert('인증번호가 올바르지 않습니다');
    //   }
    // } catch (error) {
    //   alert('인증번호가 올바르지 않습니다');
    // }
  };

  return (
    <div className='flex flex-col w-full max-w-[349px] mx-[24px] my-[53px] mobile:mt-[40px] mobile:mb-[60px] select-none'>
      <div className='flex flex-col mobile:mx-[20px] gap-3'>
        <div className='text-[28px]/8 mobile:text-[24px] text-white font-bold'>
          <div>비밀번호 재설정</div>
        </div>

        <TransparentInput
          className='!mt-[40px]'
          label='이름'
          isRequired={false}
          placeholder='이름을 입력해주세요'
          type='text'
          name='name'
          value={name}
          autoComplete={false}
          onChange={(e) => setName(e.target.value)}
          isDisabled={!isNextDisabled}
        />
        <TransparentInput
          className='!mt-[40px]'
          label='이메일'
          isRequired={false}
          placeholder='이메일을 입력해주세요'
          type='text'
          name='email'
          value={email}
          autoComplete={false}
          onChange={(e) => setEmail(e.target.value)}
          isDisabled={!isNextDisabled}
        />

        <Button 
          onPress={handleSendOtp} 
          isDisabled={!isNextDisabled}
          color='default' 
          className='!mt-[20px] h-[40px] mobile:h-[44px] w-full rounded-full !bg-[#DCDCDC]'
        >
          {isOtpDisabled ? '인증번호 보내기' : '인증번호 재전송'}
        </Button>

        <OtpInput 
          label='인증번호' 
          setOtp={setOtp} 
          isDisabled={isOtpDisabled}
          isOtpVerified={!isNextDisabled}
          onSubmitOtp={handleVerifyOtp}
        />

        <Button
          onPress={handleNextStep}
          isDisabled={isNextDisabled}
          color='primary'
          className='!mt-[20px] h-[48px] mobile:h-[44px] w-full rounded-full !bg-[#EA4336]'
        >
          다음
        </Button>

        <Button
          onPress={handleBackToLogin}
          color='default'
          className='h-[48px] mobile:h-[44px] w-full rounded-full !bg-[#DCDCDC]'
        >
          뒤로가기
        </Button>
      </div>
    </div>
  );
}