'use client';

export default function HeroIntro({userName, phase, onEnter, leaving}) {
    return (<div
            className={`
        absolute inset-0 overflow-hidden
        transition-[opacity,transform,filter]
        duration-700 ease-out will-change-transform
        ${leaving ? 'opacity-0 scale-90 translate-y-8 blur-sm' : 'opacity-100 scale-100 translate-y-0 blur-0'}
      `}
        >
            {/* 배경 */}
            <img
                src="/images/homecoming/main_img.png"
                alt=""
                className={`
          absolute inset-0 m-auto
          w-full h-auto max-w-[1400px]
          transition-opacity duration-1000 ease-out
          ${phase ? 'opacity-20' : 'opacity-100'}
        `}
            />

            {/* 콘텐츠 */}
            <div className="absolute inset-0 grid place-items-center">
                <div
                    className={`
            flex flex-col items-center
            transition-all duration-1000 ease-out
            ${phase ? 'opacity-100 -translate-y-4 scale-100' : 'opacity-0 translate-y-12 scale-95'}
          `}
                >
                    {/* 로고 */}
                    <div className="flex items-center font-ocra tracking-tight text-6xl">
                        <span className="text-cred">G</span>
                        <span className="text-cgreen">D</span>
                        <span className="text-cyellow">G</span>
                        <span className="text-cblue">o</span>
                        <span className="text-cred mr-2">C</span>
                        <span className="text-cwhite ml-1">INHA</span>
                    </div>

                    {/* 문구 */}
                    <p className="text-center text-cwhite text-4xl leading-snug">
                        <span className="font-extrabold">제 1회 홈커밍 데이</span>에{' '}
                        {userName ? (<>
                                <span className="font-extrabold">{userName}</span>님을 초대합니다!
                            </>) : (<>여러분을 초대합니다!</>)}
                    </p>

                    {/* CTA 버튼 */}
                    <button
                        onClick={onEnter}
                        className="
              mt-12 px-8 py-4
              rounded-full
              bg-cwhite text-cblack font-semibold
              transition-all duration-300
              hover:scale-105 hover:bg-cwhite
              active:scale-95
            "
                    >
                        초대장 펼쳐보기
                    </button>
                </div>
            </div>
        </div>);
}