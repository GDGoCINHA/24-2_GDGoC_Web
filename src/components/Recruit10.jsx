"use client";

export default function Recruit10( {step} ) {
  return (
    <div 
      className={`absolute flex w-full h-full bg-purple-500 transition-all duration-500 ease-in-out 
        ${step-1 == 10 ? "opacity-0" : step == 10 ? "" : step + 1 == 10? "opacity-0" : "hidden"} 
        ${step-1 == 10 ? "-translate-y-full" : step == 10 ? "translate-y-0" : step+1 == 10 ? "translate-y-full" : ""}`}>
      우왕10
    </div>
  );
}

