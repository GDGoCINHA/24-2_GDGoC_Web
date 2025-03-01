import React, { useRef, useEffect } from "react";
import NextImage from "next/image";
import { Button } from "@nextui-org/react";
import gsap from 'gsap';

import Header from "@/components/Header";
import bg from "@public/src/images/bgimg.png";

export default function HeroSection({ router }) {
    const subTitleRef = useRef(null);
    const buttonRef = useRef(null);

    const animation = () => {
        TypeHangul.type("#typing-effect", {
            text: "개발자와 비개발자가 같이 성장하는 즐거움 with Google",
            speed: 27,
            intervalType: 20,
            humanize: 0.02,
        });

        const typingEffect = document.getElementById("typing-effect");
        typingEffect.addEventListener("th.endType", () => {
            gsap.fromTo(
                subTitleRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power1.inOut" }
            );

            gsap.fromTo(
                buttonRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, delay: 0.4, ease: "power1.out",
                onComplete: () => {
                    gsap.to(buttonRef.current, {
                        y: "-=10",
                        duration: 1.5,
                        repeat: -1,
                        yoyo: true,
                        ease: "power1.inOut",
                    });
                },
                }
            );
        });
    }

    useEffect(() => {
        if (typeof window !== "undefined" && window.TypeHangul) {
            animation();
        } else {
            setTimeout(animation, 100);
        }
    }, []);

    return (
        <div id="section1" className="flex flex-col h-screen w-full relative">
            <Header />
            <NextImage
                src={bg}
                alt="bg"
                fill
                className="absolute top-0 left-0 -z-10 object-cover mobile:blur"
            />
            <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black to-transparent" />
            <div className="flex flex-col w-full h-full items-center">
                <div
                id="typing-effect"
                className="break-keep text-white/95 text-[3vw] mobile:text-xl font-extrabold min-h-[48px] mobile:min-h-[30px] mt-60 mobile:mt-40 mobile:text-center mobile:max-w-[350px]" />
                <div ref={subTitleRef} className="flex flex-col items-center opacity-0">
                    <div className="font-ocra text-4xl mt-4 flex mobile:text-5xl mobile:mt-8" >
                    <span className="text-red-500 neon-text tracking-normal">G</span>
                    <span className="text-green-500 neon-text tracking-normal">D</span>
                    <span className="text-yellow-500 neon-text tracking-normal">G</span>
                    <span className="text-blue-500 neon-text tracking-normal">o</span>
                    <span className="text-red-500 neon-text tracking-normal">C</span>
                    <span className="text-white ml-4 font-bold mobile:text-2xl mobile:mt-[17px] mobile:ml-2">
                        INHA
                    </span>
                    </div>
                    <p className="text-white/90 mt-32 text-[35px] mobile:text-2xl mobile:mt-[17svh] font-bold">
                    2025-1 Recruitment
                    </p>
                </div>
                <Button
                    onPress={() => router.push("/recruit")}
                    radius="full"
                    ref={buttonRef}
                    className="opacity-0 mt-[41px] w-60 mr-3 h-16 mobile:w-40 mobile:h-14 mobile:text-2xl bg-gradient-to-r from-[#EA4335] to-[#FF6E62] text-white text-3xl relative group"
                >
                    <span className="font-semibold">지원하기</span>
                </Button>
            </div>
        </div>
    );
}
