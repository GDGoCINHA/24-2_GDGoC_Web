import { Button } from '@nextui-org/react';

function CTASection({ router }) {

    return (
        <div id='section7' className='flex flex-col h-full w-full justify-start items-center'>
            <div className='flex flex-col justify-center items-center w-full mt-56 mobile:mt-36 text-white text-[3.5vw] mobile:text-2xl font-semibold text-center'>
            <span>
                <strong className='text-red'>G</strong>
                <strong className='text-green'>D</strong>
                <strong className='text-yellow'>G</strong>
                <strong className='text-blue'>o</strong>
                <strong className='text-red'>C</strong>와 함께
            </span>
            <br className='hidden mobile:inline' />
            변화하는 나를 만나보세요
            </div>
            <div className="flex flex-col items-center gap-4 mt-24 mb-96 mobile:mb-60">
                <Button
                    onPress={() => router.push('/recruit/member')}
                    radius='full'
                    className='w-64 max-w-full h-14 mobile:w-40 mobile:h-12 mobile:text-2xl bg-gradient-to-r from-red to-yellow text-white text-3xl relative group overflow-hidden'
                >
                    <div className='absolute inset-0 bg-gradient-to-r from-red to-yellow blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300'></div>
                    <span className='font-semibold relative z-10'>지원하기</span>
                </Button>
                <p className="text-white/50 typo-c1 mobile:text-[10px]">
                    지원 후 일정이 궁금하시다면?{' '}
                    <button 
                        onClick={() => router.push('/recruit/member/completed')}
                        className="underline underline-offset-4 hover:text-white transition-colors"
                    >
                        일정 안내 바로가기
                    </button>
                </p>
            </div>
        </div>
    );
}

export default CTASection;
