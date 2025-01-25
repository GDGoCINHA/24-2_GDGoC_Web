"use client";

export default function Recruit8( {step} ) {
  return (
    <div 
      className={`absolute flex w-full h-full bg-blue-500 transition-all duration-500 ease-in-out 
        ${step-1 == 8 ? "opacity-0" : step == 8 ? "" : step + 1 == 8? "opacity-0" : "hidden"} 
        ${step-1 == 8 ? "-translate-y-full" : step == 8 ? "translate-y-0" : step+1 == 8 ? "translate-y-full" : ""}`}>
      우왕8
    </div>
  );
}
