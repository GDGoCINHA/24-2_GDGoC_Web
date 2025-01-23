"use client";

export default function Recruit3( {step} ) {
  return (
    <div 
      className={`absolute flex w-full h-full bg-green-500 transition-all duration-500 ease-in-out 
        ${step-1 == 3 ? "opacity-0" : step == 3 ? "" : step + 1 == 3? "opacity-0" : "hidden"} 
        ${step-1 == 3 ? "-translate-y-full" : step == 3 ? "translate-y-0" : step+1 == 3 ? "translate-y-full" : ""}`}>
      우왕3
    </div>
  );
}
