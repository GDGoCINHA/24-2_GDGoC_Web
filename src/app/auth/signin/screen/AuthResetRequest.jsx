'use client'

import { Button } from '@nextui-org/react';

export default function AuthResetRequest({ handleNextStep, handleBackToLogin }) {
    return (
        <div className='flex flex-col w-full gap-4 max-w-[349px] mx-[24px] my-[53px] mobile:my-[40px] select-none mobile:mx-[32px]'>
            <div className='text-[28px]/8 mobile:text-[24px] text-white font-bold'>
                <div>비밀번호 재설정</div>
            </div>

            <Button
                onPress={handleNextStep}
                color="primary"
                className="!mt-[20px] h-[48px] mobile:h-[44px] w-full rounded-full !bg-[#EA4336]"
            >
                다음
            </Button>

            <Button
                onPress={handleBackToLogin}
                color="default"
                className="h-[48px] mobile:h-[44px] w-full rounded-full !bg-[#DCDCDC]"
            >
                뒤로가기
            </Button>
        </div>
    );
}