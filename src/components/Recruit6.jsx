"use client";

export default function Recruit6( {step} ) {
  return (
    <div 
      className={`absolute flex w-full h-full bg-orange-500 transition-all duration-500 ease-in-out 
        ${step-1 == 6 ? "opacity-0" : step == 6 ? "" : step + 1 == 6? "opacity-0" : "hidden"} 
        ${step-1 == 6 ? "-translate-y-full" : step == 6 ? "translate-y-0" : step+1 == 6 ? "translate-y-full" : ""}`}>
      우왕6
    </div>
  );
}
