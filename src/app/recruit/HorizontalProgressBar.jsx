import React from "react";

const HorizontalProgressBar = ({ step }) => {
  const getWidthPercentage = () => {
    if (step === 1) return 0;
    if (step <= 4) return 20;
    if (step === 5) return 40;
    if (step <= 7) return 60;
    if (step <= 10) return 80;
    return 100;
  };

  const steps = [1, 2, 5, 6, 8, 11];

  return (
    <div className="flex items-center relative mx-5 pc:hidden py-[45px] select-none">
      <div id="line" className="absolute flex items-center justify-center w-full h-full">
        <div id="long-line-gray" className="absolute w-full bg-gray-500 h-1"></div>
        <div
          id="long-line-red"
          className="absolute left-0 bg-red-500 h-1 transition-all duration-500 ease-in-out"
          style={{
            width: `${getWidthPercentage()}%`,
          }}
        ></div>
      </div>
      <div
        id="circle"
        className="absolute flex items-center justify-between w-full h-full"
      >
        {steps.map((i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-sm transition-all duration-500 ease-in-out ${
              step >= i ? "bg-red-500" : "bg-gray-500"
            }`}
          >
            ✓
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalProgressBar;