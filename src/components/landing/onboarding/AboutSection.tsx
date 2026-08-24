import { LANDING_ABOUT } from '@/constant/landingContent'

export default function AboutSection() {
  return (
    <section
      id="about"
      className="mx-auto max-w-[1120px] scroll-mt-[68px] px-[clamp(20px,5vw,44px)] py-[120px]"
    >
      <h2
        data-reveal
        className="max-w-[26ch] break-keep text-[clamp(26px,3.4vw,46px)] font-semibold leading-[1.32] tracking-[-0.03em]"
      >
        {LANDING_ABOUT.heading[0]}
        <br />
        {LANDING_ABOUT.heading[1]}
      </h2>

      <div
        data-reveal
        className="mt-11 max-w-[62ch] border-l border-l-[rgba(208,129,85,0.55)] pl-5"
      >
        <p className="break-keep text-base leading-[1.85] text-dusk-ink-400">
          {LANDING_ABOUT.body}
        </p>
      </div>

      <div className="mt-24 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-x-8 gap-y-10">
        {LANDING_ABOUT.values.map((value) => (
          <div key={value.index} data-reveal>
            <div className={`text-sm font-medium ${value.colorClass}`}>{value.index}</div>
            <h3 className="mt-3 text-[21px] font-semibold tracking-[-0.02em]">{value.title}</h3>
            <p className="mt-2.5 break-keep text-[15px] leading-[1.75] text-dusk-ink-600">
              {value.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
