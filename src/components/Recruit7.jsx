"use client";

export default function Recruit7( {step} ) {
  return (
    <div 
      className={`absolute flex w-full h-full bg-red-300 transition-all duration-500 ease-in-out 
        ${step-1 == 7 ? "opacity-0" : step == 7 ? "" : step + 1 == 7? "opacity-0" : "hidden"} 
        ${step-1 == 7 ? "-translate-y-full" : step == 7 ? "translate-y-0" : step+1 == 7 ? "translate-y-full" : ""}`}>
      우왕7
    </div>
  );
}

