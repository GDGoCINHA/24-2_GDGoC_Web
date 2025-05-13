import { useState } from "react";
import { Select, SelectItem, Chip } from "@nextui-org/react";

const MultipleSelectBox = ({ label, labelVisible, options, maxSelection, selectedValue, setSelectedValue }) => {
  const [isOpen, setIsOpen] = useState(false); // Select의 열림 상태를 관리

  const handleSelectionChange = (e) => {
    const selectedItems = e.target.value.split(',').filter(item => item !== '');
    
    if (selectedItems.length > maxSelection) {
      alert(`${label}은(는) ${maxSelection}개까지만 선택할 수 있습니다.`);
      return;
    }
    
    setSelectedValue(selectedItems);
  };

  const handleOpenChange = (open) => {
    setTimeout(() => {
      setIsOpen(open);
    }, 80);
  };

  return (
    <Select
      label={labelVisible ? label : null}
      aria-label={(`${label}`)}
      labelPlacement='outside'
      placeholder={`${label}을(를) 선택해주세요. (최대 ${maxSelection}개)`}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      classNames={{
        label: '!text-white text-xl pb-3 mobile:text-lg',
        trigger: `rounded-3xl min-h-[57px] bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] data-[hover=true]:bg-[#1c1c1c]`,
        value: 'text-lg mobile:text-base',
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
        <div className='flex flex-wrap gap-2 my-[10px]'>
          {items.map((item, index) => (
            <Chip key={index}>{item.props.value}</Chip>
          ))}
        </div>
      )}
      selectedKeys={selectedValue}
      onChange={handleSelectionChange}
    >
      {options.map((option, index) => (
        <SelectItem key={option} value={option}>
          {option}
        </SelectItem>
      ))}
    </Select>
  );
};

export default MultipleSelectBox;