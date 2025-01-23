"use client";

export default function Recruit5( {step} ) {
  return (
    <div 
      className={`absolute flex w-full h-full bg-purple-500 transition-all duration-500 ease-in-out 
        ${step-1 == 5 ? "opacity-0" : step == 5 ? "" : step + 1 == 5? "opacity-0" : "hidden"} 
        ${step-1 == 5 ? "-translate-y-full" : step == 5 ? "translate-y-0" : step+1 == 5 ? "translate-y-full" : ""}`}>
      우왕5
    </div>
  );
}
