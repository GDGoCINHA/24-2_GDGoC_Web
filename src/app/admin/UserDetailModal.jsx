'use client';

import React, { useEffect } from 'react';
import { Button } from '@nextui-org/react';
import clsx from 'clsx';

export default function UserDetailsModal({ user, isOpen, onClose }) {
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
        
        {/* User Basic Info */}
        <table className='w-full border-collapse border text-white mb-6'>
          <tbody>
            {[
              ['이름', user.member.name],
              ['학년', user.member.grade],
              ['학번', user.member.studentId],
              ['전화번호', user.member.phoneNumber],
              ['국적', user.member.nationality === 'etc' ? user.member.nationalityContent : user.member.nationality],
              ['Email', user.member.email],
              ['성별', user.member.gender],
              ['생년월일', user.member.birth],
              ['학교', user.member.school],
              ['전공', user.member.majors.main],
              ['부전공', user.member.majors.second.join(', ') || '없음'],
              ['가입 경로', user.member.route],
              ['회비 송금 여부', user.member.isPayed ? 'Yes' : 'No'],
            ].map(([label, userValue], idx) => (
              <tr key={idx} className={rowStyle}>
                <td className={clsx(cellStyle)}>{label}</td>
                <td className={clsx(valueStyle)}>{userValue}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='text-white space-y-7'>
          {user.answers.map((answer, idx) => {
            const questionMap = {
              1: '지원 동기',
              2: '진로 경험 & 이야기',
              3: '관심 분야',
              4: 'GDG 기수',
              5: '경로',
              6: '얻어가고 싶은 거',
              7: '기대하는 활동',
              8: '피드백',
            };

            const question = questionMap[answer.questionId];
            //배열일시 전환
            const response = Array.isArray(answer.responseValue)
              ? answer.responseValue.join(', ')
              : answer.responseValue;

            return (
              <div key={idx}>
                <hr className='border-[#5b5b6699]' />
                <div className={clsx(infoTextStyle)}>{question}</div>
                <div className='text-sm'>{response || '없음'}</div>
              </div>
            );
          })}
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