export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start w-full">
      <span className="w-5 shrink-0 text-center text-[18px] mobile:text-[16px] leading-none font-bold mt-[1px]">
        •
      </span>
      <div className="typo-pc-b2 mobile:typo-m-b3 flex-1">{children}</div>
    </div>
  )
}
