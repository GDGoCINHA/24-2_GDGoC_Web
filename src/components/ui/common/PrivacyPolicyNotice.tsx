import { cn } from '@/utils/cn'

type PolicyTarget = 'signup' | 'member' | 'core'

type PolicyRow = {
  category: string
  purpose: string[]
  fields: string
  retention: string
}

const POLICY_ROWS: Record<PolicyTarget, PolicyRow[]> = {
  signup: [
    {
      category: '회원가입',
      purpose: ['본인 확인 및 부원 식별', '서비스 제공 및 공지사항 전달'],
      fields: '이름, 학과, 학번, 휴대전화번호',
      retention: '서비스 탈퇴 시까지'
    }
  ],
  member: [
    {
      category: '부원 모집',
      purpose: ['선발 전형 진행 및 결과 안내', '성별/전공 비율 통계 분석'],
      fields: '이름, 성별, 생년월일, 주전공, 재학상태, 학번, 휴대전화번호, 이메일',
      retention: '동아리 탈퇴 시까지'
    },
    {
      category: '군 휴학 증빙',
      purpose: ['군 휴학 부원 회비 면제 대상 확인'],
      fields: '복무 확인 서류 (입영통지서, 복무증명서 등)',
      retention: '확인 후 5일 이내 파기'
    }
  ],
  core: [
    {
      category: '운영진 모집',
      purpose: ['선발 전형 진행 및 결과 안내', '선발 후 명부 관리 및 권한 부여'],
      fields: '이름, 학번, 이메일, 주전공, 휴대전화번호',
      retention: '임기 종료 시까지 (미선발 시 5일 이내 파기)'
    }
  ]
}

function RowBlock({ row, compact }: { row: PolicyRow; compact?: boolean }) {
  const rowTitleTypo = compact ? 'typo-pc-b2 mobile:typo-m-b3' : 'typo-pc-s2 mobile:typo-m-s1'
  const rowBodyTypo = compact ? 'typo-pc-c1 mobile:typo-m-c2' : 'typo-pc-b2 mobile:typo-m-b1'

  return (
    <div className="rounded-lg bg-black/25 px-3 py-2.5">
      <p className={cn(rowTitleTypo, 'text-white')}>{row.category}</p>
      <div className="mt-1.5 space-y-1 text-white">
        <p className={rowBodyTypo}>
          <span className="text-gray-700">처리 목적</span> {row.purpose.join(' / ')}
        </p>
        <p className={rowBodyTypo}>
          <span className="text-gray-700">수집 항목</span> {row.fields}
        </p>
        <p className={rowBodyTypo}>
          <span className="text-gray-700">보유 기간</span> {row.retention}
        </p>
      </div>
    </div>
  )
}

export function PrivacyPolicyNotice({
  target,
  title = '개인정보 처리방침',
  showTitle = true,
  compact = false,
  className
}: {
  target: PolicyTarget
  title?: string
  showTitle?: boolean
  compact?: boolean
  className?: string
}) {
  const rows = POLICY_ROWS[target]
  const compactMetaTypo = compact ? 'typo-pc-c1 mobile:typo-m-c2' : 'typo-pc-c1 mobile:typo-m-c1'

  return (
    <div className={cn('space-y-2', className)}>
      {showTitle ? <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">{title}</p> : null}
      <div className="rounded-xl bg-gray-100 px-4 py-3">
        <p className={cn(compactMetaTypo, 'text-gray-700')}>
          GDGoC INHA는 「개인정보 보호법」 등 관련 법령에 따라 개인정보를 안전하게 처리합니다.
        </p>
        <div className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <RowBlock key={row.category} row={row} compact={compact} />
          ))}
        </div>
        <div className="mt-3 border-t border-white/10 pt-3 space-y-1">
          <p className={cn(compactMetaTypo, 'text-gray-700')}>
            보유기간 종료, 탈퇴, 미선발 등의 사유 발생 시 영업일 기준 5일 이내 파기합니다.
          </p>
          <p className={cn(compactMetaTypo, 'text-gray-700')}>
            파기 시 디지털 데이터는 복구 불가능한 방식으로 삭제하고, 문서는 세절 처리합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
