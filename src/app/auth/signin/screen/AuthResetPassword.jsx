'use client'

import { useState } from 'react';
import TransparentInput from '@/components/ui/TransparentInput';
import { Button } from '@nextui-org/react';
import axios from 'axios';

export default function AuthResetPassword({ handleBackToLogin, handleBackToResetRequest, setLoading }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifyNewPassword, setVerifyNewPassword] = useState('');
  const API_AUTH_URL = 'https://gdgocinha.site/auth';

  const handleNewPassword = async () => {
    if (newPassword !== verifyNewPassword) {
      alert('새로운 비밀번호가 일치하지 않습니다. 다시 한 번 시도해주세요');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`${API_AUTH_URL}/password-reset/confirm`, {
        email,
        password: newPassword,
      });
      if (response.status === 200) {
        alert('비밀번호가 성공적으로 변경되었습니다.');
        setLoading(false);
        handleBackToLogin();
      }
    } catch (error) {
      alert('비밀번호 변경에 실패했습니다. 네트워크 상태를 확인해주세요.');
      setLoading(false);
    }
  };
  return (
    <div className='flex flex-col w-full gap-3 max-w-[349px] mx-[24px] my-[53px] mobile:mt-[40px] mobile:mb-[60px] select-none mobile:mx-[32px]'>
      <div className='text-[28px]/8 mobile:text-[24px] text-white font-bold'>
        <div>새 비밀번호 설정</div>
      </div>
      <p className='text-white'>새로운 비밀번호를 입력하세요.</p>
      <TransparentInput
        type='test'
        name='email'
        value={email}
        autoComplete={false}
        onChange={(e) => setEmail(e.target.value)}
        className='!mt-[40px]'
        label='이메일'
        placeholder='이메일을 입력해주세요'
      />
      <TransparentInput 
        type='password'
        name='name'
        value={newPassword}
        autoComplete={false}
        onChange={(e) => setNewPassword(e.target.value)}
        className='!mt-[40px]' 
        label='새 비밀번호' 
        placeholder='새 비밀번호를 입력해주세요' 
      />
      <TransparentInput 
        type='password'
        name='name'
        value={verifyNewPassword}
        autoComplete={false}
        onChange={(e) => setVerifyNewPassword(e.target.value)}
        className='!mt-[40px]'
        label='새 비밀번호 확인' 
        placeholder='새 비밀번호를 확인'
      />
      <Button 
        color='primary' 
        onPress={handleNewPassword} 
        className='!mt-[20px] h-[48px] mobile:h-[44px] w-full rounded-full !bg-[#EA4336]'
      >
        비밀번호 변경
      </Button>

      <Button
        onPress={handleBackToResetRequest}
        color='default'
        className='h-[48px] mobile:h-[44px] w-full rounded-full !bg-[#DCDCDC]'
      >
        이전 단계로
      </Button>
    </div>
  );
}