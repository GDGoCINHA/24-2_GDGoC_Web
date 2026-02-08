import { useState } from 'react';
import { Select, SelectItem, Chip } from "@nextui-org/react";

const SelectBox = ({ label, labelVisible, options, maxSelection }) => {
  const [interest, setInterest] = useState(new Set([]));

  const handleSelectionChange = (e) => {
    const selectedItems = new Set(e.target.value.split(','));
    if (Array.from(selectedItems).filter((item) => item !== '').length > maxSelection) {
      alert(`${label}은(는) ${maxSelection}개까지만 선택할 수 있습니다.`);
      return;
    } else {
      setInterest(selectedItems);
    }
  };

  return (
    <Select
      label={labelVisible ? label : null}
      labelPlacement='outside'
      placeholder= {`${label}을(를) 선택해주세요. (최대 ${maxSelection}개)`}
      className=''
      classNames={{
        label: '!text-white text-[21px] pb-3',
        trigger: `rounded-full bg-[#1c1c1c] !h-[57px] group-data-[focus=true]:bg-[#1c1c1c] data-[hover=true]:bg-[#1c1c1c]`,
        value: '!text-white !text-[18px] !text-[#71717a]',
        popoverContent: 'bg-[#1c1c1c]',
        innerWrapper: 'pl-2',
      }}
      popoverProps={{
        classNames: {
          base: 'mt-3',
          content: 'bg-[#1c1c1c]',
        },
      }}
      listboxProps={{
        classNames: {
          base: 'bg-[#1c1c1c] text-white',
        },
      }}
      isMultiline={true}
      selectionMode='multiple'
      renderValue={(items) => (
        <div className='flex flex-wrap gap-2'>
          {items.map((item, index) => (
            <Chip key={index}>{item.props.value}</Chip>
          ))}
        </div>
      )}
      selectedKeys={interest}
      onChange={handleSelectionChange}
    >
      {options.map((option, index) => (
        <SelectItem key={index} value={option}>
          {option}
        </SelectItem>
      ))}
    </Select>
  );
};

export default SelectBox;
