import React from 'react';
import NextImage from 'next/image';

import gdgocIcon from "@public/src/images/GDGoC_icon.png";

function Header() {
    return (
        <div className="absolute top-0 left-0flex flex-row select-none pt-[53px] px-[96px] mobile:pt-8 mobile:px-0 mobile:w-full mobile:flex mobile:justify-center">
            <div className="flex flex-row gap-x-[16px] w-fit cursor-pointer">
                <NextImage
                    className=""
                    src={gdgocIcon}
                    alt="gdgocIcon"
                    width={54}
                    height={26}
                />
                <div className="text-white text-[16px] pt-[3px]">
                    <strong>GDGoC</strong> Inha univ.
                </div>
            </div>
        </div>
    );
}

export default Header;