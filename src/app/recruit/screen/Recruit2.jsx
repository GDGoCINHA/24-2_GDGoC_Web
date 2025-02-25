"use client";

import { useState, useEffect } from 'react';
import { Input, Checkbox, Button } from '@nextui-org/react';
import axios from 'axios';

export default function Recruit2({ step, setChecked, updateRecruitData }) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [enrolledClassification, setEnrolledClassification] = useState('');
  const [isValidStudentId, setIsValidStudentId] = useState(false);
  const [isValidButtonClicked, setIsValidButtonClicked] = useState(false);

  useEffect(() => {
    const isNameFilled = name.trim() !== '';
    const isStudentIdFilled = studentId.trim() !== '';
    const isEnrolledClassificationFilled = enrolledClassification !== '';

    if (step === 2) {
      setChecked(
        isNameFilled && isStudentIdFilled && isEnrolledClassificationFilled && isValidButtonClicked && isValidStudentId
      );
      const formData = {
        name,
        studentId,
        enrolledClassification,
      };
      updateRecruitData(2, formData);
    }
  }, [
    name,
    studentId,
    enrolledClassification,
    step,
    setChecked,
    updateRecruitData,
    isValidButtonClicked,
    isValidStudentId,
  ]);

  const handleCheckDuplicate = async () => {

    try {
      const response = await axios.get(`https://www.gdgocinha.site/check/studentId`, {
        params: { studentId },
      });
      setIsValidButtonClicked(true);
      setIsValidStudentId(!response.data.data);
    } catch (error) {
      setIsValidButtonClicked(true);
      console.log('중복확인 오류 발생:', error);
      setIsValidStudentId(false);
    }
  };

  return (
    <div
      className={`absolute flex flex-col w-full h-full transition-all duration-500 ease-in-out 
        ${step - 1 === 2 ? 'opacity-0' : step === 2 ? '' : step + 1 === 2 ? 'opacity-0' : 'hidden'} 
        ${
          step - 1 === 2 ? '-translate-y-full' : step === 2 ? 'translate-y-0' : step + 1 === 2 ? 'translate-y-full' : ''
        }`}
    >
      <div className='flex flex-col w-full h-full text-white overflow-y-scroll relative'>
        <p className='text-white text-2xl mb-[27px] font-semibold mobile:text-xl'>필수 개인정보를 적어주세요</p>
        <Input
          label='국문성명'
          value={name}
          onValueChange={setName}
          variant='bordered'
          labelPlacement='outside'
          placeholder='성함을 입력해주세요'
          className='!mt-[57px]'
          disableAutoFocus
          classNames={{
            mainWrapper: 'w-60 h-[57px]',
            label: '!text-white text-xl pb-[18px] mobile:text-lg',
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white
                        group-data-[focus=true]:border-[#bbbbbb30]`,
            input: 'text-lg mobile:text-base',
          }}
        />
        <div className='flex items-end gap-3 !mt-[40px] w-full'>
          <Input
            label='학번'
            value={studentId}
            onValueChange={(value) => {
              const numValue = value.replace(/\D/g, '');
              if (numValue.length <= 8) {
                setStudentId(numValue);
                if (isValidButtonClicked) {
                  setIsValidButtonClicked(false);
                }
              }
            }}
            variant='bordered'
            autoComplete='off'
            labelPlacement='outside'
            placeholder='8자리 학번을 입력해주세요'
            inputMode='numeric'
            disableAutoFocus
            className='w-60'
            classNames={{
              mainWrapper: 'w-60 h-[57px]',
              label: '!text-white text-xl pb-[18px] mobile:text-lg',
              inputWrapper: `h-[57px] border-[1.5px] rounded-md text-white text-xl mobile:text-lg
            ${
              isValidButtonClicked
                ? isValidStudentId
                  ? '!border-[#33A652] group-data-[focus=true]:!border-[#33A652] group-data-[hover=true]:!border-[#33A652]'
                  : '!border-[#EA4336] group-data-[focus=true]:!border-[#EA4336] group-data-[hover=true]:!border-[#EA4336]'
                : '!border-[#bbbbbb30] group-data-[focus=true]:!border-[#bbbbbb30] group-data-[hover=true]:!border-[#bbbbbb30]'
            }
           `,
              input: `text-lg mobile:text-base
            ${
              isValidButtonClicked
                ? isValidStudentId
                  ? '!text-[#33A652] group-data-[focus=true]:!text-[#33A652] group-data-[hover=true]:!text-[#33A652]'
                  : '!text-[#EA4336] group-data-[focus=true]:!text-[#EA4336] group-data-[hover=true]:!text-[#EA4336]'
                : ''
            }
             `,
              errorMessage: 'hidden',
            }}
          />
          <Button
            className='w-[75px] h-[50px] mb-[4px] min-w-0 p-0 text-sm dark !bg-[#181818] border !border-[#373737]'
            onPress={handleCheckDuplicate}
          >
            중복확인
          </Button>
        </div>
        {isValidButtonClicked && (
          <p
            className={`absolute bottom-0 left-0 right-0 top-[293px] text-xs ml-[4px] mt-[3px] ${
              isValidStudentId ? 'text-[#33A652]' : 'text-[#EA4336]'
            }`}
          >
            {isValidStudentId ? '사용이 가능한 학번입니다.' : '이미 등록되었거나 형식에 맞지 않는 학번입니다.'}
          </p>
        )}

        <p className='text-white text-xl mt-[30px] mobile:text-lg'>재학 구분</p>
        <div className='flex flex-wrap gap-4 mt-[20px] w-full mobile:gap-3'>
          {['정등록', '부분등록', '휴학', '수료', '졸업'].map((label) => (
            <Checkbox
              key={label}
              isSelected={enrolledClassification === label}
              onValueChange={() => setEnrolledClassification(label)}
              radius='none'
              classNames={{
                wrapper: 'hidden',
                label: `text-white text-xl w-[150px] h-[57px] flex justify-center items-center rounded-md mobile:text-base mobile:w-[27vw] mobile:h-[49px]
                ${enrolledClassification === label ? 'bg-[#471915] border-[1.5px] border-[#ea4335]' : 'bg-[#181818]'}`,
              }}
            >
              {label}
            </Checkbox>
          ))}
        </div>
      </div>
    </div>
  );
}