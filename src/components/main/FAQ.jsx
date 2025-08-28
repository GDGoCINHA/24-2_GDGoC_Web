import React from 'react';
import { Accordion, AccordionItem } from "@nextui-org/react";

export default function FAQ() {
  const faqItems = [
    {
      key: "1",
      color: "#EA4335",
      question: "GDGoC는 어떤 동아리인가요?",
      answer: `2010년대부터 Google은 자사의 개발 언어와 기술들을 좋아하는 개발자, 비개발자들을 연결하여 커뮤니티를 만들고 커뮤니티 구성원들을 기반으로 더 많은 사람들이 연결되어 구글의 기술 생태계에 참여할 수 있길 바라왔습니다. 그렇게 한국을 포함한 전 세계 구글 본사에 구글 개발자 생태계 팀이 창설되었습니다. \n\n이후 Amazon, Microsoft, Apple 등의 빅테크 기업들도 줄지어 커뮤니티 생태계 구축에 힘쓰기 시작했습니다. 선두주자였던 Google 커뮤니티들은 현재까지도 전 세계에서 가장 큰 커뮤니티를 형성하고 활발하게 사람들을 연결하고 있습니다. \n 이후 on Campus 라는 이름으로, 대학교에서의 개발자 커뮤니티도 창설하였고, 이것이 지금의 GDGoC 입니다.`
    },
    {
      key: "2",
      color: "#34A853",
      question: "프로그래밍 기초 지식이 전혀 없는 상태인데 어떤 활동에 참여할 수 있나요?",
      answer: 'GDGoC INHA는 개발자와 비개발자가 함께 할 수 있는 커뮤니티를 목표로 두고 있습니다. 이에, 프로그래밍 기초 지식을 쌓을 수 있는 다양한 스터디 및 세미나에 참석할 수 있고, 초보를 위한 해커톤 또한 매년 개최중입니다. \n\n 이외에도 타 챕터와의 연합 체육대회, 친목 캠프 등 다양한 행사에 참여할 수 있습니다. 홈페이지의 행사 탭을 클릭하시면 보다 더 자세한 내용을 확인할 수 있습니다.'
    },
    {
      key: "3",
      color: "#4285F4",
      question: "정기 활동이 있나요?",
      answer: 'GDGoC INHA는 각 행사를 제외하고도 정기 총회를 진행하고 있습니다. 많은 멤버 수 만큼, 반드시 필참인 정기 활동은 없으며, 매달 마지막주에 정기총회를 열어, 진행상황 보고, 앞으로의 행사들 홍보, 이외 친목 시간등으로 구성된 행사를 진행합니다.'
    },
    {
      key: "4",
      color: "#F9AB00",
      question: "동방은 어디에 있나요?",
      answer: '인하대학교 5호관 동쪽 021호에 있습니다. 누구나 언제나 놀러와서 쉬다가셔도 됩니다!'
    }
  ];

  return (
    <>
      <p className='text-white text-3xl font-bold mt-32 mb-10'>자주 묻는 질문</p>
      <Accordion className="w-full rounded-3xl">
        {faqItems.map((item) => (
          <AccordionItem
            key={item.key}
            classNames={{
              trigger: 'bg-[#303030] text-white rounded-3xl px-5 py-3 text-xl font-bold'
            }}
            className='mb-5'
            aria-label={`FAQ ${item.key}`}
            startContent={<p className={`text-[${item.color}]`}>Q</p>}
            title={item.question}
          >
            <p className='text-white text-base mx-12 mt-5 mb-5'>{item.answer.split('\n\n').map((paragraph, i) => (
              <React.Fragment key={i}>
                {paragraph}
                {i < item.answer.split('\n\n').length - 1 && (
                  <>
                    <br /><br />
                  </>
                )}
              </React.Fragment>
            ))}</p>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
} 