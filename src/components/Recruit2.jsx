"use client";

export default function Recruit2( {step} ) {
  return (
    <div 
      className={`absolute flex w-full h-full bg-orange-500 transition-all duration-500 ease-in-out 
        ${step-1 == 2 ? "opacity-0" : step == 2 ? "" : step + 1 == 2? "opacity-0" : "hidden"} 
        ${step-1 == 2 ? "-translate-y-full" : step == 2 ? "translate-y-0" : step+1 == 2 ? "translate-y-full" : ""}`}>
      우왕2
    </div>
  );
}
