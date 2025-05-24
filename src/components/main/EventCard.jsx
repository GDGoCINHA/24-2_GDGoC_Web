import Image from 'next/image';
import {Button, Card, CardBody, CardFooter, CardHeader} from "@nextui-org/react";

export default function EventCard({ logo, title, statusLabel, statusColor, eventType, eventTypeColor, description, details, isHidden }) {
  return (
    <>
      <Card className='bg-[#303030] text-white p-4 h-full'>
        <CardHeader className='font-bold text-xl pb-0 gap-x-3'>
          <Image src={logo} alt='logo' height={38} className={`${isHidden ? 'hidden' : ''}`} />
          {title}
        </CardHeader>
        <CardBody className='break-keep'>
          <div className='flex flex-row gap-x-2'>
            <div className={`rounded-3xl px-4 text-black font-bold bg-[#FBBC04]`}>
              {statusLabel}
            </div>
            <div className={`rounded-3xl px-4 text-black font-bold bg-[#25bb6b]`}>
              {eventType}
            </div>
          </div>
          <p className='font-bold mt-5'>
            {description}
          </p>
          <div className='bg-[#151515] rounded-3xl p-5 text-sm flex flex-col gap-y-2 mt-5 h-full'>
            <div className='flex flex-row'>
              <p className='flex-none font-bold mr-2'>목적</p>
              <p>{details.purpose}</p>
            </div>
            <div className='flex flex-row'>
              <p className='flex-none font-bold mr-2'>일정</p>
              <p>{details.schedule}</p>
            </div>
            <div className='flex flex-row'>
              <p className='flex-none font-bold mr-2'>대상</p>
              <p dangerouslySetInnerHTML={{ __html: details.target.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        </CardBody>
        <CardFooter className='flex justify-end'>
          <Button className='bg-transparent border-1 rounded-3xl text-white font-bold h-8'>자세히 보기</Button>
        </CardFooter>
      </Card>
    </>
    // <div id="card" className='flex flex-col rounded-3xl bg-[#303030] w-full h-full max-h-[70vh] aspect-[0.7] px-6 pt-14 relative'>
    //   <div className='flex flex-row gap-x-2 mb-5'>
    //     <Image src={logo} hidden={isHidden} width={38} height={38} alt='logoimg' className='w-[38px] h-[38px] mobile:w-[28px] mobile:h-[28px]' />
    //     <p className='text-white text-[2vw] mobile:text-[16px] tablet:text-[18px] desktop:text-[24px] font-bold'>{title}</p>
    //   </div>
    //   <div className='flex flex-row gap-x-5 mb-5'>
    //     <div className='border-3 mobile:border-2 border-[#E94335] bg-[#E94335] rounded-3xl text-black font-bold text-xl mobile:text-sm tablet:text-base desktop:text-xl flex items-center justify-center px-2'>
    //       {statusLabel}
    //     </div>
    //     <div className='border-3 mobile:border-2 border-[#34A853] bg-[#34A853] rounded-3xl text-black font-bold text-xl mobile:text-sm tablet:text-base desktop:text-xl flex items-center justify-center px-2'>
    //       {eventType} 
    //     </div>
    //   </div>
    //   <p className='text-white text-[1.5vw] mobile:text-[14px] tablet:text-[16px] desktop:text-[20px] font-bold mb-6'>{description}</p>
    //   <div className='flex flex-col w-full px-4 py-7 mobile:px-3 mobile:py-5 bg-[#151515] rounded-3xl text-white text-[1.2vw] mobile:text-[12px] tablet:text-[14px] desktop:text-[16px]'>
    //     <div className='flex flex-row gap-x-5 mobile:gap-x-3 mb-2'>
    //       <p className='flex-none'><strong>목적</strong></p>
    //       <p>{details.purpose}</p>
    //     </div>
    //     <div className='flex flex-row gap-x-5 mobile:gap-x-3 mb-2'>
    //       <p className='flex-none'><strong>일정</strong></p>
    //       <p>{details.schedule}</p>
    //     </div>
    //     <div className='flex flex-row gap-x-5 mobile:gap-x-3 mb-2'>
    //       <p className='flex-none'><strong>대상</strong></p>
    //       <p dangerouslySetInnerHTML={{ __html: details.target.replace(/\n/g, '<br/>') }} />
    //     </div>
    //   </div>
    //   <div className='flex w-full mt-5 mb-1 justify-end absolute bottom-3 right-6 mobile:right-4'>
    //     <Button className='bg-transparent border-1 w-28 mobile:w-24 h-6 rounded-3xl text-white font-bold text-base mobile:text-sm text-center justify-center items-center'>자세히 보기</Button>
    //   </div>
    // </div>
  );
} 