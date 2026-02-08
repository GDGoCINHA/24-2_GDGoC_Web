import Image from 'next/image';
import {Button, Card, CardBody, CardFooter, CardHeader} from "@nextui-org/react";

export default function EventCard({ logo, title, statusLabel, statusColor, eventType, eventTypeColor, description, details, isHidden }) {
  return (
    <>
      <Card className='bg-gray-100 text-white p-4 h-full'>
        <CardHeader className='font-bold text-xl pb-0 gap-x-3'>
          <Image src={logo} alt='logo' height={38} className={`${isHidden ? 'hidden' : ''}`} />
          {title}
        </CardHeader>
        <CardBody className='break-keep'>
          <div className='flex flex-row gap-x-2'>
            <div className='rounded-3xl px-4 text-black font-bold bg-yellow'>
              {statusLabel}
            </div>
            <div className='rounded-3xl px-4 text-black font-bold bg-green'>
              {eventType}
            </div>
          </div>
          <p className='font-bold mt-5'>
            {description}
          </p>
          <div className='bg-black rounded-3xl p-5 text-sm flex flex-col gap-y-2 mt-5 h-full'>
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
  );
} 
