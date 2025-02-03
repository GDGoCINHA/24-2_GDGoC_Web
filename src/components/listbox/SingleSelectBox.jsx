import { Select, SelectItem } from "@nextui-org/react";

const SingleSelectBox = ({ options, selectedValue, setSelectedValue, label, labelVisible, placeHolder }) => {
  return (
    <Select
      label={labelVisible ? label : null}
      labelPlacement='outside'
      placeholder={`${placeHolder}`}
      className="w-[300px] !mt-[10px]"
      value={selectedValue}
      onChange={(e) => setSelectedValue(e.target.value)}
      classNames={{
        trigger: "h-[57px] bg-[#181818] border-[#bbbbbb30] border-[1.5px] data-[hover=true]:bg-[#181818] data-[hover=true]:border-[#bbbbbb30]",
        value: "!text-white text-lg",
        label: labelVisible ? "!text-white text-xl pb-[18px]" : "sr-only",
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