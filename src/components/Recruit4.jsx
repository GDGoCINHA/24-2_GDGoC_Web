"use client";

export default function Recruit4( {step} ) {
  return (
    <div 
      className={`absolute flex w-full h-full bg-blue-500 transition-all duration-500 ease-in-out 
        ${step-1 == 4 ? "opacity-0" : step == 4 ? "" : step + 1 == 4? "opacity-0" : "hidden"} 
        ${step-1 == 4 ? "-translate-y-full" : step == 4 ? "translate-y-0" : step+1 == 4 ? "translate-y-full" : ""}`}>
      우왕4
    </div>
  );
}
