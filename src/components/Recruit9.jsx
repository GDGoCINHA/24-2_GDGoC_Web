"use client";

export default function Recruit9( {step} ) {
  return (
    <div 
      className={`absolute flex w-full h-full bg-green-500 transition-all duration-500 ease-in-out 
        ${step-1 == 9 ? "opacity-0" : step == 9 ? "" : step + 1 == 9? "opacity-0" : "hidden"} 
        ${step-1 == 9 ? "-translate-y-full" : step == 9 ? "translate-y-0" : step+1 == 9 ? "translate-y-full" : ""}`}>
      우왕9
    </div>
  );
}
