'use client'

export default function CustomCheckbox({
  checked,
  onChange,
  required,
  label = '동의합니다.',
  size = 5
}) {
  return (
    <label className="flex items-center cursor-pointer">
      {required && <span className="text-red-600 ml-1 text-xl align-middle">*</span>}
      <span className="text-white text-lg font-medium">{label}</span>
      {/* 체크박스 컨테이너 */}
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only" // 기본 체크박스 숨김
          checked={checked}
          onChange={onChange}
        />
        {/* 커스텀 체크박스 박스 */}
        <div
          className={`
            w-6 h-6 border-2 rounded-md transition-all duration-200 flex items-center justify-center
            ${checked ? 'bg-red-600 border-red-600' : 'bg-transparent border-gray-500'}
          `}
        >
          {/* 흰색 체크 표시 (SVG) */}
          {checked && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="www.w3.org"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          )}
        </div>
      </div>
    </label>
  )
}
