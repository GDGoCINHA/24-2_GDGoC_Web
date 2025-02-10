"use client";

import { useState, useEffect } from 'react';
import { Autocomplete, AutocompleteItem, AutocompleteSection, Input } from '@nextui-org/react';

export default function Recruit5({ step, setChecked, updateRecruitData }) {
  const [major, setMajor] = useState('');
  const [doubleMajor, setDoubleMajor] = useState('');

  useEffect(() => {
    const isMajorFilled = major ? major.trim() !== '' : false;

    if (step === 5) {
      setChecked(isMajorFilled);
      const formData = {
        major,
        doubleMajor,
      };
      updateRecruitData(5, formData);
    }
  }, [major, doubleMajor, step, setChecked, updateRecruitData]);

  return (
    <div
      className={`absolute flex flex-col w-full h-full transition-all duration-500 ease-in-out 
        ${step - 1 == 5 ? 'opacity-0' : step == 5 ? '' : step + 1 == 5 ? 'opacity-0' : 'hidden'} 
        ${step - 1 == 5 ? '-translate-y-full' : step == 5 ? 'translate-y-0' : step + 1 == 5 ? 'translate-y-full' : ''}`}
    >
      <p className='text-white text-2xl font-semibold mobile:text-xl'>필수 개인정보를 적어주세요</p>
      <Autocomplete
        label='주전공'
        labelPlacement='outside'
        placeholder='검색 혹은 스크롤하여 지정하세요'
        className='!mt-14 w-96 mobile:w-[90vw]'
        classNames={{
          popoverContent: 'bg-[#1c1c1c]',
          selectorButton: 'text-white',
        }}
        inputProps={{
          classNames: {
            label: '!text-white text-xl pb-3 mobile:text-lg',
            inputWrapper:
              'rounded-full bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]',
            input: '!text-white text-xl mobile:text-lg',
          },
        }}
        popoverProps={{
          classNames: {
            base: 'mt-3',
          },
        }}
        listboxProps={{
          classNames: {
            base: 'bg-[#1c1c1c] text-white',
          },
        }}
        selectedKeys={major}
        onSelectionChange={setMajor}
        disableAutoFocus
      >
        <AutocompleteSection title='프런티어 학부대학'>
          <AutocompleteItem key='자유전공학부' aria-label='자유전공학부' value='자유전공학부'>
            자유전공학부
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='공과대학' showDivider>
          <AutocompleteItem key='기계공학과' aria-label='기계공학과' value='기계공학과'>
            기계공학과
          </AutocompleteItem>
          <AutocompleteItem key='항공우주공학과' aria-label='항공우주공학과' value='항공우주공학과'>
            항공우주공학과
          </AutocompleteItem>
          <AutocompleteItem key='조선해양공학과' aria-label='조선해양공학과' value='조선해양공학과'>
            조선해양공학과
          </AutocompleteItem>
          <AutocompleteItem key='산업경영공학과' aria-label='산업경영공학과' value='산업경영공학과'>
            산업경영공학과
          </AutocompleteItem>
          <AutocompleteItem key='화학공학과' aria-label='화학공학과' value='화학공학과'>
            화학공학과
          </AutocompleteItem>
          <AutocompleteItem key='고분자공학과' aria-label='고분자공학과' value='고분자공학과'>
            고분자공학과
          </AutocompleteItem>
          <AutocompleteItem key='신소재공학과' aria-label='신소재공학과' value='신소재공학과'>
            신소재공학과
          </AutocompleteItem>
          <AutocompleteItem key='사회인프라공학과' aria-label='사회인프라공학과' value='사회인프라공학과'>
            사회인프라공학과
          </AutocompleteItem>
          <AutocompleteItem key='환경공학과' aria-label='환경공학과' value='환경공학과'>
            환경공학과
          </AutocompleteItem>
          <AutocompleteItem key='공간정보공학과' aria-label='공간정보공학과' value='공간정보공학과'>
            공간정보공학과
          </AutocompleteItem>
          <AutocompleteItem key='건축학부(건축공학)' aria-label='건축학부(건축공학)' value='건축학부(건축공학)'>
            건축학부(건축공학)
          </AutocompleteItem>
          <AutocompleteItem key='건축학부(건축학)' aria-label='건축학부(건축학)' value='건축학부(건축학)'>
            건축학부(건축학)
          </AutocompleteItem>
          <AutocompleteItem key='에너지자원공학과' aria-label='에너지자원공학과' value='에너지자원공학과'>
            에너지자원공학과
          </AutocompleteItem>
          <AutocompleteItem key='융합기술경영학부' aria-label='융합기술경영학부' value='융합기술경영학부'>
            융합기술경영학부
          </AutocompleteItem>
          <AutocompleteItem key='전기공학과' aria-label='전기공학과' value='전기공학과'>
            전기공학과
          </AutocompleteItem>
          <AutocompleteItem key='전자공학과' aria-label='전자공학과' value='전자공학과'>
            전자공학과
          </AutocompleteItem>
          <AutocompleteItem key='정보통신공학과' aria-label='정보통신공학과' value='정보통신공학과'>
            정보통신공학과
          </AutocompleteItem>
          <AutocompleteItem key='반도체시스템공학과' aria-label='반도체시스템공학과' value='반도체시스템공학과'>
            반도체시스템공학과
          </AutocompleteItem>
          <AutocompleteItem
            key='미래자동차공학(융합전공)'
            aria-label='미래자동차공학(융합전공)'
            value='미래자동차공학(융합전공)'
          >
            미래자동차공학(융합전공)
          </AutocompleteItem>
          <AutocompleteItem
            key='이차전지공학(융합전공)'
            aria-label='이차전지공학(융합전공)'
            value='이차전지공학(융합전공)'
          >
            이차전지공학(융합전공)
          </AutocompleteItem>
          <AutocompleteItem key='반도체공학(융합전공)' aria-label='반도체공학(융합전공)' value='반도체공학(융합전공)'>
            반도체공학(융합전공)
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='자연과학대학' showDivider>
          <AutocompleteItem key='수학과' aria-label='수학과' value='수학과'>
            수학과
          </AutocompleteItem>
          <AutocompleteItem key='통계학과' aria-label='통계학과' value='통계학과'>
            통계학과
          </AutocompleteItem>
          <AutocompleteItem key='물리학과' aria-label='물리학과' value='물리학과'>
            물리학과
          </AutocompleteItem>
          <AutocompleteItem key='화학과' aria-label='화학과' value='화학과'>
            화학과
          </AutocompleteItem>
          <AutocompleteItem key='해양과학과' aria-label='해양과학과' value='해양과학과'>
            해양과학과
          </AutocompleteItem>
          <AutocompleteItem key='식품영양학과' aria-label='식품영양학과' value='식품영양학과'>
            식품영양학과
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='경영대학' showDivider>
          <AutocompleteItem key='경영학과' aria-label='경영학과' value='경영학과'>
            경영학과
          </AutocompleteItem>
          <AutocompleteItem key='글로벌금융학과' aria-label='글로벌금융학과' value='글로벌금융학과'>
            글로벌금융학과
          </AutocompleteItem>
          <AutocompleteItem key='아태물류학부' aria-label='아태물류학부' value='아태물류학부'>
            아태물류학부
          </AutocompleteItem>
          <AutocompleteItem key='국제통상학과' aria-label='국제통상학과' value='국제통상학과'>
            국제통상학과
          </AutocompleteItem>
          <AutocompleteItem
            key='기후위기대응(융합전공)'
            aria-label='기후위기대응(융합전공)'
            value='기후위기대응(융합전공)'
          >
            기후위기대응(융합전공)
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='사범대학' showDivider>
          <AutocompleteItem key='국어교육과' aria-label='국어교육과' value='국어교육과'>
            국어교육과
          </AutocompleteItem>
          <AutocompleteItem key='영어교육과' aria-label='영어교육과' value='영어교육과'>
            영어교육과
          </AutocompleteItem>
          <AutocompleteItem key='사회교육과' aria-label='사회교육과' value='사회교육과'>
            사회교육과
          </AutocompleteItem>
          <AutocompleteItem key='교육학과' aria-label='교육학과' value='교육학과'>
            교육학과
          </AutocompleteItem>
          <AutocompleteItem key='체육교육과' aria-label='체육교육과' value='체육교육과'>
            체육교육과
          </AutocompleteItem>
          <AutocompleteItem key='수학교육과' aria-label='수학교육과' value='수학교육과'>
            수학교육과
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='사회과학대학' showDivider>
          <AutocompleteItem key='행정학과' aria-label='행정학과' value='행정학과'>
            행정학과
          </AutocompleteItem>
          <AutocompleteItem key='정치외교학과' aria-label='정치외교학과' value='정치외교학과'>
            정치외교학과
          </AutocompleteItem>
          <AutocompleteItem
            key='미디어커뮤니케이션학과'
            aria-label='미디어커뮤니케이션학과'
            value='미디어커뮤니케이션학과'
          >
            미디어커뮤니케이션학과
          </AutocompleteItem>
          <AutocompleteItem key='경제학과' aria-label='경제학과' value='경제학과'>
            경제학과
          </AutocompleteItem>
          <AutocompleteItem key='소비자학과' aria-label='소비자학과' value='소비자학과'>
            소비자학과
          </AutocompleteItem>
          <AutocompleteItem key='아동심리학과' aria-label='아동심리학과' value='아동심리학과'>
            아동심리학과
          </AutocompleteItem>
          <AutocompleteItem key='사회복지학과' aria-label='사회복지학과' value='사회복지학과'>
            사회복지학과
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='문과대학' showDivider>
          <AutocompleteItem key='한국어문학과' aria-label='한국어문학과' value='한국어문학과'>
            한국어문학과
          </AutocompleteItem>
          <AutocompleteItem key='사학과' aria-label='사학과' value='사학과'>
            사학과
          </AutocompleteItem>
          <AutocompleteItem key='철학과' aria-label='철학과' value='철학과'>
            철학과
          </AutocompleteItem>
          <AutocompleteItem key='중국학과' aria-label='중국학과' value='중국학과'>
            중국학과
          </AutocompleteItem>
          <AutocompleteItem key='일본언어문화학과' aria-label='일본언어문화학과' value='일본언어문화학과'>
            일본언어문화학과
          </AutocompleteItem>
          <AutocompleteItem key='영어영문학과' aria-label='영어영문학과' value='영어영문학과'>
            영어영문학과
          </AutocompleteItem>
          <AutocompleteItem key='프랑스언어문화학과' aria-label='프랑스언어문화학과' value='프랑스언어문화학과'>
            프랑스언어문화학과
          </AutocompleteItem>
          <AutocompleteItem
            key='문화콘텐츠문화경영학과'
            aria-label='문화콘텐츠문화경영학과'
            value='문화콘텐츠문화경영학과'
          >
            문화콘텐츠문화경영학과
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='의과대학' showDivider>
          <AutocompleteItem key='의예과' aria-label='의예과' value='의예과'>
            의예과
          </AutocompleteItem>
          <AutocompleteItem key='의학과' aria-label='의학과' value='의학과'>
            의학과
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='간호대학' showDivider>
          <AutocompleteItem key='간호학과' aria-label='간호학과' value='간호학과'>
            간호학과
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='미래융합대학' showDivider>
          <AutocompleteItem key='메카트로닉스공학과' aria-label='메카트로닉스공학과' value='메카트로닉스공학과'>
            메카트로닉스공학과
          </AutocompleteItem>
          <AutocompleteItem key='소프트웨어융합공학과' aria-label='소프트웨어융합공학과' value='소프트웨어융합공학과'>
            소프트웨어융합공학과
          </AutocompleteItem>
          <AutocompleteItem key='산업경영학과' aria-label='산업경영학과' value='산업경영학과'>
            산업경영학과
          </AutocompleteItem>
          <AutocompleteItem key='금융투자학과' aria-label='금융투자학과' value='금융투자학과'>
            금융투자학과
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='예술체육대학' showDivider>
          <AutocompleteItem key='조형예술학과' aria-label='조형예술학과' value='조형예술학과'>
            조형예술학과
          </AutocompleteItem>
          <AutocompleteItem key='디자인융합학과' aria-label='디자인융합학과' value='디자인융합학과'>
            디자인융합학과
          </AutocompleteItem>
          <AutocompleteItem key='스포츠과학과' aria-label='스포츠과학과' value='스포츠과학과'>
            스포츠과학과
          </AutocompleteItem>
          <AutocompleteItem key='연극영화학과' aria-label='연극영화학과' value='연극영화학과'>
            연극영화학과
          </AutocompleteItem>
          <AutocompleteItem key='의류디자인학과' aria-label='의류디자인학과' value='의류디자인학과'>
            의류디자인학과
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='국제학부' showDivider>
          <AutocompleteItem key='IBT학과' aria-label='IBT학과' value='IBT학과'>
            IBT학과
          </AutocompleteItem>
          <AutocompleteItem key='ISE학과' aria-label='ISE학과' value='ISE학과'>
            ISE학과
          </AutocompleteItem>
          <AutocompleteItem key='KLC학과' aria-label='KLC학과' value='KLC학과'>
            KLC학과
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='소프트웨어융합대학' showDivider>
          <AutocompleteItem key='인공지능공학과' aria-label='인공지능공학과' value='인공지능공학과'>
            인공지능공학과
          </AutocompleteItem>
          <AutocompleteItem key='데이터사이언스학과' aria-label='데이터사이언스학과' value='데이터사이언스학과'>
            데이터사이언스학과
          </AutocompleteItem>
          <AutocompleteItem key='스마트모빌리티공학과' aria-label='스마트모빌리티공학과' value='스마트모빌리티공학과'>
            스마트모빌리티공학과
          </AutocompleteItem>
          <AutocompleteItem key='디자인테크놀로지학과' aria-label='디자인테크놀로지학과' value='디자인테크놀로지학과'>
            디자인테크놀로지학과
          </AutocompleteItem>
          <AutocompleteItem key='컴퓨터공학과' aria-label='컴퓨터공학과' value='컴퓨터공학과'>
            컴퓨터공학과
          </AutocompleteItem>
        </AutocompleteSection>
        <AutocompleteSection title='바이오시스템융합학부' showDivider>
          <AutocompleteItem key='생명공학과' aria-label='생명공학과' value='생명공학과'>
            생명공학과
          </AutocompleteItem>
          <AutocompleteItem key='바이오제약공학과' aria-label='바이오제약공학과' value='바이오제약공학과'>
            바이오제약공학과
          </AutocompleteItem>
          <AutocompleteItem key='생명과학과' aria-label='생명과학과' value='생명과학과'>
            생명과학과
          </AutocompleteItem>
        </AutocompleteSection>
      </Autocomplete>
      <div className='flex flex-col w-full mt-6'>
        <p className='text-white text-xl mobile:text-lg'>다중전공 (선택)</p>
        <p className='text-white text-base mt-2 mobile:text-sm'>
          • 현재 진행 중인 다중 전공(복수전공, 부전공, 융합전공, 연계전공)을 순서에 맞게 띄어쓰기 없이 정확한 이름으로
          입력해주세요.
          <br /> ex) XXX 학과 복수전공, 000학과 융합전공
        </p>
        <Input
          value={doubleMajor}
          onValueChange={setDoubleMajor}
          variant='bordered'
          labelPlacement='outside'
          placeholder='다중전공이 있을경우 입력해주세요.'
          className='!mt-5'
          classNames={{
            mainWrapper: 'w-96 h-[57px] mobile:w-[90vw]',
            label: '!text-white text-xl pb-[18px] mobile:text-lg',
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl mobile:text-lg
                                group-data-[focus=true]:border-[#bbbbbb30]`,
            input: 'text-lg mobile:text-base',
          }}
        />
      </div>
    </div>
  );
}
