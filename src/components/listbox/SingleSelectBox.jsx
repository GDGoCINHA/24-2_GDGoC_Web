import { Select, SelectItem } from "@nextui-org/react";

const SingleSelectBox = ({ options, selectedValue, setSelectedValue, label, labelVisible, placeHolder, ariaLabel }) => {
  return (
    <Select
      label={labelVisible ? label : null}
      aria-labelledby={(`${ariaLabel}`)}
      labelPlacement='outside'
      placeholder={`${placeHolder}`}
      className="w-[300px] !mt-[10px]"
      value={selectedValue}
      onChange={(e) => setSelectedValue(e.target.value)}
      classNames={{
        mainWrapper: 'mobile:w-[85vw]',
        trigger: "h-[57px] bg-[#181818] border-[#bbbbbb30] border-[1.5px] data-[hover=true]:bg-[#181818] data-[hover=true]:border-[#bbbbbb30]",
        value: "!text-white text-lg mobile:text-base",
        label: labelVisible ? "!text-white text-xl pb-[18px] mobile:text-lg" : "sr-only",
        popoverContent: "bg-[#181818]",
        selectorIcon: "text-white"
      }}
    >
      {options.map((item) => (
        <SelectItem key={item} value={item} textValue={item} className="text-white">
          {item}
        </SelectItem>
      ))}
    </Select>
  );
};

export default SingleSelectBox;