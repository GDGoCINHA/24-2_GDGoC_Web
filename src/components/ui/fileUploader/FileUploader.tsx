import { useEffect, useRef, useState, InputHTMLAttributes } from 'react'
import Image from 'next/image'

/**
 * @param {'pc' | 'mobile'} device - PC 또는 Mobile 디바이스 타입
 * @param {File[]} files - 첨부된 파일 배열
 * @param {(files: File[]) => void} onFilesChange - 파일 배열 변경 시 호출되는 콜백
 */
interface FileUploaderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  device?: 'pc' | 'mobile'
  files?: File[]
  onFilesChange?: (files: File[]) => void
}

const DEVICE_CONFIG = {
  pc: {
    container: 'w-[550px] h-11',
    fileBox: 'w-[522px] px-4 py-2.5 gap-4',
    text: 'text-base leading-6',
    icon: 'w-5 h-5'
  },
  mobile: {
    container: 'w-[343px] h-10',
    fileBox: 'w-[315px] px-3 py-2 gap-3',
    text: 'text-sm leading-5',
    icon: 'w-4 h-4'
  }
}

const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)}mb`
}

const FileUploader = ({
  device = 'pc',
  files,
  onFilesChange,
  disabled,
  accept,
  ...props
}: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const config = DEVICE_CONFIG[device]
  const [internalFiles, setInternalFiles] = useState<File[]>([])

  useEffect(() => {
    if (files) {
      setInternalFiles(files)
    }
  }, [files])

  const currentFiles = files ?? internalFiles

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedList = e.target.files
    if (!selectedList || selectedList.length === 0) return

    const newFiles = [...currentFiles, ...Array.from(selectedList)]
    setInternalFiles(newFiles)
    onFilesChange?.(newFiles)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = (index: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    const updated = currentFiles.filter((_, i) => i !== index)
    setInternalFiles(updated)
    onFilesChange?.(updated)
  }
  return (
    <div className="flex flex-col gap-3">
      <div className={config.container}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={disabled}
          accept={accept}
          className="hidden"
          {...props}
        />
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={disabled}
          className={`
            ${config.container}
            bg-red hover:bg-red/90 active:bg-red/80
            disabled:bg-gray-500 disabled:cursor-not-allowed
            rounded-xl px-4 py-2.5
            flex items-center justify-between
            font-pretendard font-medium ${config.text} text-white
            transition-colors
          `.trim().replace(/\s+/g, ' ')}
        >
          <span>+ 파일 선택</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {currentFiles.map((item, index) => (
          <div key={`${item.name}-${index}`} className={`${config.container} flex items-center gap-2`}>
            <div className={`
              ${config.fileBox}
              bg-gray-100 rounded-xl
              flex items-center justify-between
              font-pretendard font-medium ${config.text}
            `.trim().replace(/\s+/g, ' ')}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Image
                  src="/icons/ui/file-icon.svg"
                  alt="file"
                  width={16}
                  height={16}
                  className="shrink-0"
                />
                <p className="text-white truncate flex-1" title={item.name}>
                  {item.name}
                </p>
              </div>
              <p className="text-gray-700 shrink-0">
                {formatFileSize(item.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              className={`
                ${config.icon}
                shrink-0
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:opacity-80 transition-opacity
              `.trim().replace(/\s+/g, ' ')}
              aria-label="파일 삭제"
            >
              <Image
                src="/icons/ui/trash-icon.svg"
                alt="delete"
                width={20}
                height={20}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FileUploader
