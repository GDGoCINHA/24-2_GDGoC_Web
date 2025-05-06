import Image from 'next/image';
import {Button} from "@nextui-org/react";

export default function EventCard({ logo, title, statusLabel, statusColor, eventType, eventTypeColor, description, details, isHidden }) {
  return (
    <div id="card" className='flex flex-col rounded-3xl bg-[#303030] w-full max-w-[28vw] h-full max-h-[70vh] aspect-[0.7] px-6 pt-14 relative'>
      <div className='flex flex-row gap-x-2 mb-5'>
        <Image src={logo} hidden={isHidden} width={38} height={38} alt='logoimg' />
        <p className='text-white text-[2vw] font-bold'>{title}</p>
      </div>
      <div className='flex flex-row gap-x-5 mb-5'>
        <div className={`flex rounded-3xl w-[115px] h-[35px] bg-[${statusColor}] text-black font-bold text-xl text-center justify-center items-center`}>
          {statusLabel}
        </div>
        <div className={`flex rounded-3xl w-[115px] h-[35px] bg-[${eventTypeColor}] text-black font-bold text-xl text-center justify-center items-center`}>
          {eventType}
        </div>
      </div>
      <p className='text-white text-[1.5vw] font-bold mb-6'>{description}</p>
      <div className='flex flex-col w-full px-4 py-7 bg-[#151515] rounded-3xl text-white text-[1.2vw]'>
        <div className='flex flex-row gap-x-5 mb-2'>
          <p className='flex-none'><strong>목적</strong></p>
          <p>{details.purpose}</p>
        </div>
        <div className='flex flex-row gap-x-5 mb-2'>
          <p className='flex-none'><strong>일정</strong></p>
          <p>{details.schedule}</p>
        </div>
        <div className='flex flex-row gap-x-5 mb-2'>
          <p className='flex-none'><strong>대상</strong></p>
          <p dangerouslySetInnerHTML={{ __html: details.target.replace(/\n/g, '<br/>') }} />
        </div>
      </div>
      <div className='flex w-full mt-5 mb-1 justify-end absolute bottom-3 right-6'>
        <Button className='bg-transparent border-1 w-28 h-6 rounded-3xl text-white font-bold text-base text-center justify-center items-center'>자세히 보기</Button>
      </div>
    </div>
  );
} 