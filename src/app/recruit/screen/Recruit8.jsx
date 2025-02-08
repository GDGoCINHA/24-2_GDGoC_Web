import { useState, useEffect } from 'react';
import { Input } from '@nextui-org/react';

import MultipleSelectBox from '../../../components/listbox/MultipleSelectBox';
import SingleSelectBox from '../../../components/listbox/SingleSelectBox';

export default function Recruit8({ step, setChecked, updateRecruitData }) {
  const gdgInterestOptions = [
    'UI/UX',
    'IT 기획 및 경영',
    'PM',
    '스타트업',
    '디지털 마케팅 / 브랜딩',
    '비즈니스 개발',
    'Frontend',
    'Backend',
    'Mobile',
    'Game',
    '3D 디자인',
    'AI / ML',
    'Data Science / Big Data',
    'Embedded Systems / IoT',
    'Cybersecurity',
    'Blockchain / Web3',
  ];
  const [gdgInterest, setGdgInterest] = useState([]);

  const gdgPeriodOptions = ['25-1', '24-2', '24-1', '23-2', '23-1', '22-2', '22-1', '21-2', '21-1'];
  const [gdgPeriod, setGdgPeriod] = useState([]);

  const gdgRouteOptions = [
    '지인의 소개',
    '에브리타임',
    '소속 단톡방 홍보글',
    'IT 정보공유방(오픈카톡방)',
    '오프라인 포스터',
    '기타',
  ];
  const [gdgRoute, setGdgRoute] = useState('');
  const [etcGdgRoute, setEtcGdgRoute] = useState('');

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

  return (
    <div
      className={`absolute flex w-full h-full bg-transparent transition-all duration-500 ease-in-out 
        ${step - 1 == 8 ? 'opacity-0' : step == 8 ? '' : step + 1 == 8 ? 'opacity-0' : 'hidden'} 
        ${step - 1 == 8 ? '-translate-y-full' : step == 8 ? 'translate-y-0' : step + 1 == 8 ? 'translate-y-full' : ''}`}
    >
      <div className='flex flex-col w-full h-full mx-[10px] text-white overflow-y-scroll'>
        <MultipleSelectBox
          label='관심분야'
          labelVisible={true}
          options={gdgInterestOptions}
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
          options={gdgPeriodOptions}
          maxSelection={9}
          selectedValue={gdgPeriod}
          setSelectedValue={setGdgPeriod}
        />
        <div className='text-xl mt-[20px] mobile:text-lg' id='gdgRoute'>어떤 경로를 통해 GDG on Campus를 알게 되셨나요?</div>
        <SingleSelectBox
          options={gdgRouteOptions}
          ariaLabel='gdgRoute'
          selectedValue={gdgRoute}
          setSelectedValue={setGdgRoute}
          labelVisible={false}
          placeHolder={'항목을 선택해주세요'}
        />
        {gdgRoute === '기타' && (
          <Input
            variant='bordered'
            placeholder='어떤 경로를 통해 알게 되었나요?'
            className='max-w-xs mt-4'
            value={etcGdgRoute}
            onValueChange={setEtcGdgRoute}
            classNames={{
              mainWrapper: 'w-90 h-[57px] mobile:w-[85vw]',
              label: '!text-white text-xl pb-[18px] mobile:text-lg',
              inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl mobile:text-lg
                            group-data-[focus=true]:border-[#bbbbbb30]`,
            }}
          />
        )}
      </div>
    </div>
  );
}