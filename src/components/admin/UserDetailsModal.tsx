'use client';

import React, { useEffect } from 'react';
import { Button } from '@nextui-org/react';
import clsx from 'clsx';

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

  return (
    <div className='fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50'>
      <div className='max-w-[600px] w-full max-h-[90vh] mobile:max-h-[80vh] bg-[#27272A] rounded-lg shadow-md p-6 overflow-y-auto'>
        <div className='text-lg font-bold text-center text-white mb-4'>User Details</div>

        {/* User Basic Info (공통 + 코어 지원 정보 포함) */}
        <table className='w-full border-collapse border text-white mb-6'>
          <tbody>
            {[
              ['이름', user?.name],
              ['전공', user?.major],
              ['학번', user?.studentId],
              ['회비 송금 여부', typeof user?.isPayed === 'boolean' ? (user.isPayed ? 'Yes' : 'No') : undefined],
              ['이메일', user?.email],
              ['전화번호', user?.phone],
              ['지원팀', user?.team],
              ['제출 시각', user?.createdAt],
            ]
              .filter(([, val]) => val !== undefined && val !== null && val !== '')
              .map(([label, userValue], idx) => (
                <tr key={idx} className={rowStyle}>
                  <td className={clsx(cellStyle)}>{label}</td>
                  <td className={clsx(valueStyle)}>{userValue}</td>
                </tr>
              ))}
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
          <Button color='primary' onPress={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
