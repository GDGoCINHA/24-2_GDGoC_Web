import React from "react";

const VerticalProgressBar = ({ step }) => {
  const getHeightPercentage = () => {
    if (step === 1) return 0;
    if (step <= 4) return 20;
    if (step === 5) return 40;
    if (step <= 7) return 60;
    if (step <= 10) return 80;
    return 100;
  };

  const steps = [1, 2, 5, 6, 8, 11];

  return (
    <div className="flex flex-col relative pr-[46px] mobile:hidden select-none">
      <div id="line" className="absolute flex items-center justify-center h-full w-full">
        <div id="long-line-gray" className="absolute h-full bg-gray-500 w-1"></div>
        <div
          id="long-line-red"
          className="absolute top-0 bg-red-500 w-1 transition-all duration-500 ease-in-out"
          style={{
            height: `${getHeightPercentage()}%`,
          }}
        ></div>
      </div>
      <div
        id="circle"
        className="absolute flex flex-col items-center justify-between h-full w-full"
      >
        {steps.map((i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${
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

export default VerticalProgressBar;