'use client'

import { useDeviceType } from './hooks/useDeviceType'
import HomecomingMobile from './component/mobile/HomecomingMobile'
import HomecomingDesktop from './component/pc/HomecomingDesktop'

export default function Page() {
  const device = useDeviceType()

  if (device === null) {
    return <div className="bg-black h-screen" />
  }

  return device === 'mobile' ? <HomecomingMobile /> : <HomecomingDesktop />
}
