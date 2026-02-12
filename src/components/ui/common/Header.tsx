import React from 'react'
import { GdgLogo } from '@/components/ui/design-system'

function Header() {
  return (
    <div className="absolute top-0 left-0flex flex-row select-none pt-[53px] px-[96px] mobile:pt-8 mobile:px-0 mobile:w-full mobile:flex mobile:justify-center">
      <div className="w-fit cursor-pointer">
        <GdgLogo mode="auto" variant="long" />
      </div>
    </div>
  )
}

export default Header
