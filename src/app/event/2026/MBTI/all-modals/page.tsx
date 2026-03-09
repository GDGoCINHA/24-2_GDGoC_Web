'use client'

const TYPE_ORDER = [
  'LPTI',
  'LPTF',
  'LSTI',
  'LSTF',
  'CPTI',
  'CPTF',
  'CSTI',
  'CSTF',
  'LPUI',
  'LPUF',
  'LSUI',
  'LSUF',
  'CPUI',
  'CPUF',
  'CSUI',
  'CSUF'
]

const getShortPreviewImageSrc = (type: string) => `/images/MBTI/mbti-${type}.png`

export default function MbtiAllModalsPreviewPage() {
  const downloadCard = (type: string) => {
    const link = document.createElement('a')
    link.download = `mbti-${type}.png`
    link.href = getShortPreviewImageSrc(type)
    link.click()
  }

  return (
    <main className="min-h-screen bg-[#f0f0f0] px-4 py-8">
      <div className="mx-auto w-full max-w-[1120px]">
        <p className="mb-4 text-lg font-bold text-[#1e1e1e]">MBTI 모달 16종 미리보기 (임시)</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TYPE_ORDER.map((type) => (
            <section
              key={type}
              className="mx-auto w-full max-w-[375px] rounded-lg bg-white p-4 shadow-[0_0_8px_rgba(30,30,30,0.25)]"
            >
              <div className="mx-auto w-full max-w-[343px] pb-2">
                <img
                  src={getShortPreviewImageSrc(type)}
                  alt={`${type} 짧은 결과 이미지`}
                  className="h-auto w-full rounded-2xl"
                  loading="eager"
                  decoding="sync"
                />
              </div>
              <button
                type="button"
                className="font-dunggeunmo mt-4 h-12 w-full rounded-lg bg-red text-sm text-white shadow-[0_0_4px_rgba(30,30,30,0.25)]"
                onClick={() => downloadCard(type)}
              >
                PNG 저장하기
              </button>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
