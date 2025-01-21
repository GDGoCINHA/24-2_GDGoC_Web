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

  const infoTextStyle = 'font-bold text-xl pb-[10px]';

  return (
    <div className='fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50'>
      <div className='max-w-[600px] w-full max-h-[90vh] mobile:max-h-[80vh] bg-[#27272A] rounded-lg shadow-md p-6 overflow-y-auto'>
        <div className='text-lg font-bold text-center text-white mb-4'>User Details</div>
        <table className='w-full border-collapse border text-white mb-6'>
          <tbody>
            {[
              ['이름', user.name],
              ['학년', user.grade],
              ['학번', user.studentID],
              ['국적', user.nationality],
              ['Email', user.email],
              ['성별', user.gender],
              ['생년월일', user.birth],
              ['학교', user.school],
              ['전공', user.major],
              ['부전공', user.second_major || '없음'],
              ['GDG 활동 학기', user.gdg_semester.join(', ')],
              ['가입 경로', user.route],
              ['합격 여부', user.status],
              ['관심사', user.interests.join(', ')],
            ].map(([label, value], idx) => (
              <tr key={idx} className={rowStyle}>
                <td className={clsx(cellStyle)}>{label}</td>
                <td className={clsx(valueStyle)}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 추가 정보 */}
        <div className='text-white space-y-7'>
          {[
            ['지원 이유', user.apply_reason],
            ['생애와 이야기', user.life_and_story],
            ['희망 사항', user.want_to_get.join(', ')],
            ['기타 활동', user.other_activity || '없음'],
            ['피드백', user.feedback || '없음'],
          ].map(([label, value], idx) => (
            <div key={idx}>
              <div className={clsx(infoTextStyle)}>{label}</div>
              <div className='text-sm'> {value}</div>
            </div>
          ))}
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
