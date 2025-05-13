import { Button } from '@nextui-org/react';

function CTASection({ router }) {

    return (
        <div id='section7' className='flex flex-col h-full w-full justify-start items-center'>
            <div className='flex flex-col justify-center items-center w-full mt-56 mobile:mt-36 text-white text-[3.5vw] mobile:text-2xl font-semibold text-center'>
            <span>
                <strong className='text-[#EA4335]'>G</strong>
                <strong className='text-[#34A853]'>D</strong>
                <strong className='text-[#F9AB00]'>G</strong>
                <strong className='text-[#4285F4]'>o</strong>
                <strong className='text-[#EA4335]'>C</strong>와 함께
            </span>
            <br className='hidden mobile:inline' />
            변화하는 나를 만나보세요
            </div>
            <div className='flex flex-row mt-32 mb-96 mobile:mb-60 w-full justify-center items-center space-x-3'>
            <Button
                onPress={() => router.push('/recruit')}
                radius='full'
                className='w-64 max-w-full h-14 mobile:w-40 mobile:h-12 mobile:text-2xl bg-gradient-to-r from-[#EA4335] to-[#FF6E62] text-white text-3xl relative group'
            >
                <div className='absolute inset-0 bg-gradient-to-r from-[#EA4335] to-[#FF6E62] blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300'></div>
                <span className='font-semibold relative z-10'>지원하기</span>
            </Button>
            </div>
        </div>
    );
}

export default CTASection;