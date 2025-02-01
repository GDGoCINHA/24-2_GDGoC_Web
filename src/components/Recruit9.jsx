"use client";

import { useState } from 'react';
import { Input } from '@nextui-org/react';

import SingleSelectBox from './listbox/SingleSelectBox';
import MultipleSelectBox from './listbox/MultipleSelectBox';
export default function Recruit9({ step }) {
  const gdgWishOptions = [
    '친구',
    '비슷한 관심사를 가진 동기',
    '공부 메이트',
    '네트워킹(인맥)',
    '지식/정보 공유',
    '프로젝트 경험',
    '프로젝트 파트너',
    '학점에 도움되는 스터디',
    '취업준비를 위한 스터디',
    '구글에서 제공하는 스터디',
    '타 대학 GDG Campus 챕터와의 교류',
    '타 학과 및 대내외 협업 경험',
    'Google Goods',
    'IT분야 기초 지식',
    '기초 개발(프로그래밍) 지식',
    '기타',
  ];
  const [gdgWish, setGdgWish] = useState(new Set());
  const [etcGdgWish, setEtcGdgWish] = useState(''); //기타 입력 상태

  const gdgExpectOptions = ['네, 원하는 활동이 있습니다', '아니요, 원하는 활동이 없습니다'];
  const [gdgExpect, setGdgExpect] = useState('');
  const [etcGdgExpect, setEtcGdgExpect] = useState(''); //기타 입력 상태

  return (
    <div
      className={`absolute flex w-full h-full bg-transparent transition-all duration-500 ease-in-out 
        ${step - 1 == 9 ? 'opacity-0' : step == 9 ? '' : step + 1 == 9 ? 'opacity-0' : 'hidden'} 
        ${step - 1 == 9 ? '-translate-y-full' : step == 9 ? 'translate-y-0' : step + 1 == 9 ? 'translate-y-full' : ''}`}
    >
      <div className='flex flex-col w-full h-full mx-[10px] text-white'>
        <div className='text-xl my-[10px]'>GDG on campus INHA에서 무엇을 얻어가고 싶으신가요? (중복선택 가능)</div>

        <MultipleSelectBox
          label='얻어가고 싶은 것'
          labelVisible={false}
          options={gdgWishOptions}
          maxSelection={6}
          selectedValue={gdgWish}
          setSelectedValue={setGdgWish}
        />

        {gdgWish.has('기타') && (
          <Input
            variant='bordered'
            placeholder='무엇을 GDGoC INHA에서 얻어가고 싶으신가요?'
            className='max-w-xs mt-4'
            value={etcGdgWish}
            onChange={(e) => setEtcGdgWish(e.target.value)}
            classNames={{
              mainWrapper: 'w-140 h-[57px]',
              label: '!text-white text-xl pb-[18px]',
              inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl
                            group-data-[focus=true]:border-[#bbbbbb30]`,
            }}
          />
        )}

        <div className='text-xl mt-[20px]'>이 외에 GDG on campus에서 기대하거나 원하는 활동이 있으신가요?</div>
        <div className='text-sm text-[#eeeeee] mt-[10px]'>
          <ul>
            <li>
              • ex) 이런 프로젝트 하고 싶어요, 이런 스터디 있으면 좋겠어요, 이런 활동 있으면 좋겠어요
            </li>
            <li>• 자유롭게 <strong className='text-[#EF4444]'>요청사항</strong>을 작성해주세요. 활동 기획에 반영하겠습니다!</li>
          </ul>
        </div>
        <SingleSelectBox
          options={gdgExpectOptions}
          selectedValue={gdgExpect}
          setSelectedValue={setGdgExpect}
          labelVisible={false}
          placeHolder={'항목을 선택해주세요'}
        />
        {gdgExpect === '네, 원하는 활동이 있습니다' && (
          <Input
            variant='bordered'
            placeholder='저희 GDGoC에 어떠한 활동을 기대하거나 원하시나요?'
            className='max-w-xs mt-4'
            value={etcGdgExpect}
            onValueChange={setEtcGdgExpect}
            classNames={{
              mainWrapper: 'w-[480px] h-[57px]',
              label: '!text-white text-xl pb-[18px]',
              inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl
                            group-data-[focus=true]:border-[#bbbbbb30]`,
            }}
          />
        )}
      </div>
    </div>
  );
}