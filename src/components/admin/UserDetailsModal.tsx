'use client';

import React, { useEffect } from 'react';
import { Button } from '@nextui-org/react';
import clsx from 'clsx';
import { formatMajorLabel } from '@/constant/majorOptions';
import { formatPhoneNumberDisplay } from '@/utils/phoneNumber';

const FIELD_LABELS = {
  id: 'ID',
  name: '이름',
  studentId: '학번',
  enrolledClassification: '재학 구분',
  phoneNumber: '전화번호',
  email: '이메일',
  gender: '성별',
  birth: '생년월일',
  major: '전공',
  admissionSemester: '입학 학기',
  isPayed: '회비 송금 여부',
  createdAt: '생성 시각',
  updatedAt: '수정 시각',
};

const PRIMARY_FIELD_ORDER = [
  'name',
  'studentId',
  'enrolledClassification',
  'phoneNumber',
  'email',
  'gender',
  'birth',
  'major',
  'isPayed',
];

const RESERVED_KEYS = new Set(['answers', 'id', 'admissionSemester', 'createdAt', 'updatedAt']);

const ENROLLED_CLASSIFICATION_LABELS = {
  FULL_REGISTRATION: '재학',
  LEAVE_OF_ABSENCE: '휴학',
  MILITARY_LEAVE: '군휴학',
  GRADUATION: '졸업',
  PARTIAL_REGISTRATION: '부분등록',
  COMPLETION: '수료',
};

const GENDER_LABELS = {
  MALE: '남성',
  FEMALE: '여성',
  PRIVATE: '비공개',
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    if (value.length === 0) return '-';
    if (value.every((item) => ['string', 'number', 'boolean'].includes(typeof item))) {
      return value.join(', ');
    }
    return JSON.stringify(value, null, 2);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const formatFieldValue = (key, value) => {
  if (typeof value === 'string' && (key === 'phoneNumber' || key === 'phone')) {
    return formatPhoneNumberDisplay(value);
  }
  if (key === 'enrolledClassification' && typeof value === 'string') {
    return ENROLLED_CLASSIFICATION_LABELS[value] ?? value;
  }
  if (key === 'gender' && typeof value === 'string') {
    return GENDER_LABELS[value] ?? value;
  }
  if (key === 'isPayed' && typeof value === 'boolean') {
    return value ? '입금 완료' : '미입금';
  }
  if (key === 'major' && typeof value === 'string') {
    return formatMajorLabel(value);
  }
  return formatValue(value);
};

export default function UserDetailsModal({ user, isOpen, onClose, preventClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const rowStyle = 'border border-[#5b5b6699]';
  const cellStyle = 'p-3 font-bold text-gray-300';
  const valueStyle = 'p-3';
  const infoTextStyle = 'font-bold text-xl py-[10px]';

  const userRecord = user && typeof user === 'object' ? user : {};
  const allKeys = Object.keys(userRecord).filter((key) => !RESERVED_KEYS.has(key));
  const orderedKeys = PRIMARY_FIELD_ORDER.filter((key) => allKeys.includes(key));
  const remainingKeys = allKeys.filter((key) => !PRIMARY_FIELD_ORDER.includes(key));
  const displayKeys = [...orderedKeys, ...remainingKeys];

  return (
    <div
      className='fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50'
      onClick={(event) => {
        if (preventClose) return;
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className='max-w-[600px] w-full max-h-[90vh] mobile:max-h-[80vh] bg-[#27272A] rounded-lg shadow-md p-6 overflow-y-auto'>
        <div className='text-lg font-bold text-center text-white mb-4'>User Details</div>

        <table className='w-full border-collapse border text-white mb-6'>
          <tbody>
            {displayKeys.map((key) => {
              const value = formatFieldValue(key, userRecord[key]);
              const isMultiline = typeof value === 'string' && (value.includes('\n') || value.length > 100);
              const label = FIELD_LABELS[key] ?? key;
              return (
                <tr key={key} className={rowStyle}>
                  <td className={clsx(cellStyle)}>{label}</td>
                  <td className={clsx(valueStyle)}>
                    {isMultiline ? (
                      <pre className='whitespace-pre-wrap break-all text-sm m-0'>{value}</pre>
                    ) : (
                      value
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className='text-white space-y-7'>
          {(Array.isArray(user?.answers?.answers) ? user.answers.answers : []).map((answer, idx) => {
            const questionMap = {
              APPLY_MOTIVATION: '지원 동기',
              LIFE_STORY: '진로 경험 & 이야기',
              INTERESTS: '관심 분야',
              GDG_PERIOD: 'GDG 기수',
              ROUTE_TO_KNOW: '경로',
              WANT_TO_GET: '얻어가고 싶은 거',
              EXPECTED_ACTIVITY: '기대하는 활동',
              FEEDBACK: '피드백',
              PROOF_FILE: '재학 상태 증빙 파일',
            };

            const question = questionMap[answer?.inputType] ?? answer?.inputType ?? '질문';
            const value = answer?.responseValue;
            const response = Array.isArray(value) ? value.join(', ') : value;
            const isLinkValue = typeof response === 'string' && /^https?:\/\//.test(response);

            return (
              <div key={answer?.id ?? idx}>
                <hr className='border-[#5b5b6699]' />
                <div className={clsx(infoTextStyle)}>{question}</div>
                {isLinkValue ? (
                  <Button
                    className='!bg-[#4285F4] !text-white'
                    onPress={() => window.open(response, '_blank', 'noopener,noreferrer')}
                  >
                    파일 열기
                  </Button>
                ) : (
                  <div className='text-sm'>{response || '없음'}</div>
                )}
              </div>
            );
          })}

          {[
            ['지원 동기', user?.motivation],
            ['원하는 업무/프로젝트/비전', user?.wish],
            ['장점/역량', user?.strengths],
            ['각오', user?.pledge],
          ]
            .filter(([, val]) => val !== undefined && val !== null && String(val).trim() !== '')
            .map(([label, val], idx) => (
              <div key={`core-${idx}`}>
                <hr className='border-[#5b5b6699]' />
                <div className={clsx(infoTextStyle)}>{label}</div>
                <div className='text-sm whitespace-pre-line'>{val}</div>
              </div>
            ))}

          {Array.isArray(user?.fileUrls) && user.fileUrls.length > 0 && (
            <div>
              <hr className='border-[#5b5b6699]' />
              <div className={clsx(infoTextStyle)}>첨부 파일</div>
              <div className='flex flex-wrap gap-2'>
                {user.fileUrls.map((url, idx) => (
                  <Button
                    key={`${url}-${idx}`}
                    className='!bg-[#4285F4] !text-white'
                    onPress={() => window.open(url, '_blank', 'noopener,noreferrer')}
                  >
                    바로가기 {idx + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='flex justify-end mt-6'>
          <Button color='primary' onPress={onClose} isDisabled={Boolean(preventClose)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
