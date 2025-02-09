'use client';

import { useState, useEffect } from 'react';
import { Input } from '@nextui-org/react';

import MultipleSelectBox from '../../../components/listbox/MultipleSelectBox';
export default function Recruit9({ step, setChecked, updateRecruitData }) {
  const gdgWishOptions = [
    '네트워킹',
    '공부 메이트 & 스터디',
    '프로젝트 경험 & 파트너',
    '취업 & 진로 준비',
    '타 대학과의 교류',
    '구글 관련 활동 & 혜택',
    'IT & 개발 지식',
    '기타',
  ];
  const [gdgWish, setGdgWish] = useState([]);
  const [etcGdgWish, setEtcGdgWish] = useState(''); //기타 입력 상태

  const gdgExpectOptions = [
    '해커톤 참여',
    '스터디 참여',
    '네트워킹 참여',
    '현직자 강연',
    '선배/현직자 멘토링',
    '토이 프로젝트 참여',
    '기타',
  ];
  const [gdgExpect, setGdgExpect] = useState([]);
  const [etcGdgExpect, setEtcGdgExpect] = useState(''); //기타 입력 상태

  useEffect(() => {
    const isWishFilled = gdgWish.length > 0;
    const isEtcWishFilled = !gdgWish.includes('기타') || etcGdgWish.trim() !== '';

    const isExpectFilled = gdgExpect.length > 0;
    const isEtcExpectFilled = !gdgExpect.includes('기타') || etcGdgExpect.trim() !== '';

    if (step === 9) {
      setChecked(isWishFilled && isEtcWishFilled && isExpectFilled && isEtcExpectFilled);
      
      const gdgWishCombined = gdgWish
        .map((wish) => (wish === '기타' ? etcGdgWish : wish))
        .filter((wish) => wish !== '기타' || etcGdgWish.trim() !== '');
      const gdgExpectCombined = gdgExpect
        .map((expect) => (expect === '기타' ? etcGdgExpect : expect))
        .filter((expect) => expect !== '기타' || etcGdgExpect.trim() !== '');

      const formData = {
        gdgWish: gdgWishCombined,
        gdgExpect: gdgExpectCombined,
      };

      updateRecruitData(9, formData);
    }
  }, [gdgWish, etcGdgWish, gdgExpect, etcGdgExpect, step, setChecked, updateRecruitData]);

  return (
    <div
      className={`absolute flex w-full h-full bg-transparent transition-all duration-500 ease-in-out 
        ${step - 1 == 9 ? 'opacity-0' : step == 9 ? '' : step + 1 == 9 ? 'opacity-0' : 'hidden'} 
        ${step - 1 == 9 ? '-translate-y-full' : step == 9 ? 'translate-y-0' : step + 1 == 9 ? 'translate-y-full' : ''}`}
    >
      <div className='flex flex-col w-full h-full mx-[10px] text-white overflow-y-scroll'>
        <div className='text-xl my-[10px] mobile:text-lg'>
          GDG on Campus INHA에서 무엇을 얻어가고 싶으신가요? (중복선택 가능)
        </div>

        <MultipleSelectBox
          label='얻어가고 싶은 것'
          labelVisible={false}
          options={gdgWishOptions}
          maxSelection={6}
          selectedValue={gdgWish}
          setSelectedValue={setGdgWish}
        />

        {gdgWish.includes('기타') && (
          <Input
            variant='bordered'
            placeholder='무엇을 GDGoC에서 얻어가고 싶으신가요?'
            className='max-w-xs mt-4'
            value={etcGdgWish}
            onChange={(e) => setEtcGdgWish(e.target.value)}
            classNames={{
              mainWrapper: 'w-140 h-[57px] mobile:w-[85vw]',
              label: '!text-white text-lg pb-[18px] mobile:text-base',
              inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl mobile:text-base
                            group-data-[focus=true]:border-[#bbbbbb30]`,
              input: 'text-lg mobile:text-base',
            }}
          />
        )}

        <div className='text-xl mt-[30px] mobile:text-lg'>
          이 외에 GDG on campus에서 기대하거나 원하는 활동이 있으신가요?
        </div>
        <div className='text-sm text-[#eeeeee] my-[10px]'>
          <ul>
            <li>• ex) 이런 프로젝트 하고 싶어요, 이런 스터디 있으면 좋겠어요, 이런 활동 있으면 좋겠어요</li>
            <li>
              • 선택지에 없는 활동을 원하시면 <strong className='text-[#EF4444]'>&apos;기타&apos;</strong> 항목을 선택
              후<strong className='text-[#EF4444]'> 요청사항</strong>을 작성해주세요. 반영하여 활동을 기획하겠습니다!
            </li>
          </ul>
        </div>
        <MultipleSelectBox
          label='희망하는 활동'
          labelVisible={false}
          options={gdgExpectOptions}
          maxSelection={3}
          selectedValue={gdgExpect}
          setSelectedValue={setGdgExpect}
        />

        {gdgExpect.includes('기타') && (
          <Input
            variant='bordered'
            placeholder='GDGoC에서 어떤 활동을 희망하시나요?'
            className='max-w-xs mt-4'
            value={etcGdgExpect}
            onChange={(e) => setEtcGdgExpect(e.target.value)}
            classNames={{
              mainWrapper: 'w-140 h-[57px] mobile:w-[85vw]',
              label: '!text-white text-xl pb-[18px] mobile:text-lg',
              inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl mobile:text-lg
                            group-data-[focus=true]:border-[#bbbbbb30]`,
              input: 'text-lg mobile:text-base',
            }}
          />
        )}
      </div>
    </div>
  );
}
