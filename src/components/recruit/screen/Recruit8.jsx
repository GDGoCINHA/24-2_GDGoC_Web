import { useState, useEffect, useRef } from 'react';
import { Input } from '@nextui-org/react';

import MultipleSelectBox from '@/components/ui/input/select/MultipleSelectBox';
import SingleSelectBox from '@/components/ui/input/select/SingleSelectBox';

import { interestOptions } from '@/constant/interestOptions';
import { reachFromOptions } from "@/constant/reachFromOptions";
import { semesterOptions } from '@/constant/semesterOptions';

export default function Recruit8({ step, setChecked, updateRecruitData }) {
  const [gdgInterest, setGdgInterest] = useState([]);
  const [gdgPeriod, setGdgPeriod] = useState([]);
  const [gdgRoute, setGdgRoute] = useState('');
  const [etcGdgRoute, setEtcGdgRoute] = useState('');
  const gdgRouteInputRef = useRef(null);

  useEffect(() => {
    const isInterestFilled = gdgInterest.length > 0;
    const isPeriodFilled = gdgPeriod.length > 0;
    const isRouteFilled = gdgRoute.trim() !== '';
    const isEtcRouteFilled = gdgRoute !== '기타' || etcGdgRoute.trim() !== '';

    if (step === 8) {
      setChecked(isInterestFilled && isPeriodFilled && isRouteFilled && isEtcRouteFilled);
      const formData = {
        gdgInterest,
        gdgPeriod,
        gdgRoute: gdgRoute === '기타' ? etcGdgRoute : gdgRoute,
      };

      updateRecruitData(8, formData);
    }
  }, [gdgInterest, gdgPeriod, gdgRoute, etcGdgRoute, step, setChecked, updateRecruitData]);

  useEffect(() => {
    if (gdgRoute === '기타' && gdgRouteInputRef.current) {
      gdgRouteInputRef.current.focus();
    }
  }, [gdgRoute]);

  return (
    <div
      className={`absolute flex w-full h-full bg-transparent transition-all duration-500 ease-in-out 
        ${step - 1 === 8 ? 'opacity-0' : step === 8 ? '' : step + 1 === 8 ? 'opacity-0' : 'hidden'} 
        ${step - 1 === 8 ? '-translate-y-full' : step === 8 ? 'translate-y-0' : step + 1 === 8 ? 'translate-y-full' : ''}`}
    >
      <div className='flex flex-col w-full h-full mx-[10px] text-white overflow-y-scroll'>
        <MultipleSelectBox
          label='관심분야'
          labelVisible={true}
          options={interestOptions}
          maxSelection={3}
          selectedValue={gdgInterest}
          setSelectedValue={setGdgInterest}
        />
        <div className='text-xl mt-[20px] mobile:text-lg'>GDG on Campus 기수</div>
        <div className='text-sm text-[#eeeeee] my-[10px]'>
          <ul>
            <li>
              • 현재 지원 기수 및 기존 활동 기수를 <strong className='text-[#EF4444]'>모두</strong> 선택해주세요.
            </li>
            <li>• 신입 멤버는 &apos;25-1&apos; 하나만 선택해주시면 됩니다.</li>
          </ul>
        </div>
        <MultipleSelectBox
          label='GDGoC 기수'
          labelVisible={false}
          options={semesterOptions}
          maxSelection={9}
          selectedValue={gdgPeriod}
          setSelectedValue={setGdgPeriod}
        />
        <div className='text-xl mt-[20px] mobile:text-lg' id='gdgRoute'>
          어떤 경로를 통해 GDG on Campus를 알게 되셨나요?
        </div>
        <SingleSelectBox
          options={reachFromOptions}
          ariaLabel='gdgRoute'
          selectedValue={gdgRoute}
          setSelectedValue={setGdgRoute}
          labelVisible={false}
          placeHolder={'항목을 선택해주세요'}
        />
        {gdgRoute === '기타' && (
          <Input
            ref={gdgRouteInputRef}
            variant='bordered'
            placeholder='어떤 경로를 통해 알게 되었나요?'
            className='max-w-xs mt-4'
            value={etcGdgRoute}
            onValueChange={setEtcGdgRoute}
            classNames={{
              mainWrapper: 'w-90 h-[57px] mobile:w-[85vw]',
              label: '!text-white text-xl pb-[18px] mobile:text-lg',
              inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white
                            group-data-[focus=true]:border-[#bbbbbb30]`,
              input: 'text-lg mobile:text-base',
            }}
          />
        )}
      </div>
    </div>
  );
}