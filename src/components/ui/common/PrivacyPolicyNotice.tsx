import { cn } from '@/utils/cn'

type PolicyTarget = 'signup' | 'member' | 'core' | 'memo'

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
  ],
  memo: [
    {
      category: '신입생 지원 알림 신청',
      purpose: ['신입생 지원 일정 안내', '지원 가능 시점 알림 전달'],
      fields: '이름, 휴대전화번호, 이메일',
      retention: '신입생 지원 기간 종료 시까지 (또는 동의 철회 시)'
    }
  ]
}

function RowBlock({ row, compact }: { row: PolicyRow; compact?: boolean }) {
  const bodySize = compact ? 'text-[13px]' : 'text-sm'

  return (
    <div className="rounded-[10px] bg-[rgba(24,20,29,0.55)] px-4 py-3.5">
      <p className="text-[15px] text-dusk-ink-100">{row.category}</p>
      <div className={cn('mt-2.5 flex flex-col gap-1.5 leading-[1.7] text-dusk-ink-200', bodySize)}>
        <p>
          <span className="text-dusk-ink-700">처리 목적</span> {row.purpose.join(' / ')}
        </p>
        <p>
          <span className="text-dusk-ink-700">수집 항목</span> {row.fields}
        </p>
        <p>
          <span className="text-dusk-ink-700">보유 기간</span> {row.retention}
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

  return (
    <div className={className}>
      {showTitle ? (
        <h2 className="mb-3 text-[15px] font-medium text-dusk-ink-200">{title}</h2>
      ) : null}
      <div className="rounded-[14px] border border-[rgba(240,234,228,0.12)] px-5 py-[18px]">
        <p className="text-[13px] leading-[1.7] text-dusk-ink-700">
          GDGoC INHA는 「개인정보 보호법」 등 관련 법령에 따라 개인정보를 안전하게 처리합니다.
        </p>
        <div className="mt-3.5 flex flex-col gap-2.5">
          {rows.map((row) => (
            <RowBlock key={row.category} row={row} compact={compact} />
          ))}
        </div>
        <div className="mt-3.5 flex flex-col gap-1.5 border-t border-t-[rgba(240,234,228,0.10)] pt-3.5 text-[13px] leading-[1.7] text-dusk-ink-700">
          <p>보유기간 종료, 탈퇴, 미선발 등의 사유 발생 시 영업일 기준 5일 이내 파기합니다.</p>
          <p>파기 시 디지털 데이터는 복구 불가능한 방식으로 삭제하고, 문서는 세절 처리합니다.</p>
        </div>
      </div>
    </div>
  )
}
