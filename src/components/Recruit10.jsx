'use client';

import { useState } from 'react';
import { Textarea } from '@nextui-org/react';
import SingleSelectBox from './listbox/SingleSelectBox';

export default function Recruit10({ step }) {
  const gdgFeedbackOptions = ['저는 신입 멤버입니다', '피드백 사항이 없습니다', 'GDGoC에 원하는 사항이 있습니다'];
  const [gdgFeedback, setGdgFeedback] = useState('');
  const [etcGdgFeedback, setEtcGdgFeedback] = useState(''); //기타 입력 상태
  return (
    <div
      className={`absolute flex w-full h-full bg-transparent transition-all duration-500 ease-in-out 
        ${step - 1 == 10 ? 'opacity-0' : step == 10 ? '' : step + 1 == 10 ? 'opacity-0' : 'hidden'} 
        ${
          step - 1 == 10 ? '-translate-y-full' : step == 10 ? 'translate-y-0' : step + 1 == 10 ? 'translate-y-full' : ''
        }`}
    >
      <div className='flex flex-col w-full h-full mx-[10px] text-white'>
        <div className='text-xl mt-[20px]'>(기존 멤버) 피드백</div>
        <div className='text-sm text-[#eeeeee] mt-[10px]'>
          <ul>
            <li>
              • 기존 멤버로 활동하시면서&nbsp;
              <strong className='text-[#EF4444]'>
                건의 및 문의사항 / 아쉬웠던 점 / 바라는 점 / 기억에 남는 재미있었던 활동 / 새로 개설했으면 하는 행사
              </strong>
              등을 자유롭게 작성해주세요. (선택)
            </li>
          </ul>
        </div>
        <SingleSelectBox
          options={gdgFeedbackOptions}
          selectedValue={gdgFeedback}
          setSelectedValue={setGdgFeedback}
          labelVisible={false}
          placeHolder={'항목을 선택해주세요'}
        />
        {gdgFeedback === 'GDGoC에 원하는 사항이 있습니다' && (
          <Textarea
            disableAutosize
            className='dark w-full h-full mt-[18px] rounded-2xl'
            labelPlacement='outside'
            placeholder='GDGoC에 원하는 사항을 적어주세요.'
            value={etcGdgFeedback}
            onValueChange={setEtcGdgFeedback}
            classNames={{
              innerWrapper: '!h-full',
              input: '!h-full',
              inputWrapper: `border-1 border-[#ffffff34] !h-full`,
            }}
          />
        )}
      </div>
    </div>
  );
}
