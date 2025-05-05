import React from 'react';
import { Accordion, AccordionItem } from "@nextui-org/react";

export default function FAQ() {
  const faqItems = [
    {
      key: "1",
      color: "#EA4335",
      question: "GDGoC는 어떤 동아리인가요?",
      answer: `2010년대부터 Google은 자사의 개발 언어와 기술들을 좋아하는 개발자, 비개발자들을 연결하여 커뮤니티를 만들고 커뮤니티 구성원들을 기반으로 더 많은 사람들이 연결되어 구글의 기술 생태계에 참여할 수 있길 바라왔습니다. 그렇게 한국을 포함한 전 세계 구글 본사에 구글 개발자 생태계 팀이 창설되었습니다. \n\n이후 Amazon, Microsoft, Apple 등의 빅테크 기업들도 줄지어 커뮤니티 생태계 구축에 힘쓰기 시작했습니다. 선두주자였던 Google 커뮤니티들은 현재까지도 전 세계에서 가장 큰 커뮤니티를 형성하고 활발하게 사람들을 연결하고 있습니다.`
    },
    {
      key: "2",
      color: "#34A853",
      question: "프로그래밍 기초 지식이 전혀 없는 상태에서도 회원 가입이 가능한가요?",
      answer: `2010년대부터 Google은 자사의 개발 언어와 기술들을 좋아하는 개발자, 비개발자들을 연결하여 커뮤니티를 만들고 커뮤니티 구성원들을 기반으로 더 많은 사람들이 연결되어 구글의 기술 생태계에 참여할 수 있길 바라왔습니다. 그렇게 한국을 포함한 전 세계 구글 본사에 구글 개발자 생태계 팀이 창설되었습니다. \n\n이후 Amazon, Microsoft, Apple 등의 빅테크 기업들도 줄지어 커뮤니티 생태계 구축에 힘쓰기 시작했습니다. 선두주자였던 Google 커뮤니티들은 현재까지도 전 세계에서 가장 큰 커뮤니티를 형성하고 활발하게 사람들을 연결하고 있습니다.`
    },
    {
      key: "3",
      color: "#4285F4",
      question: "면접이나 지원 조건이 있을까요?",
      answer: `2010년대부터 Google은 자사의 개발 언어와 기술들을 좋아하는 개발자, 비개발자들을 연결하여 커뮤니티를 만들고 커뮤니티 구성원들을 기반으로 더 많은 사람들이 연결되어 구글의 기술 생태계에 참여할 수 있길 바라왔습니다. 그렇게 한국을 포함한 전 세계 구글 본사에 구글 개발자 생태계 팀이 창설되었습니다. \n\n이후 Amazon, Microsoft, Apple 등의 빅테크 기업들도 줄지어 커뮤니티 생태계 구축에 힘쓰기 시작했습니다. 선두주자였던 Google 커뮤니티들은 현재까지도 전 세계에서 가장 큰 커뮤니티를 형성하고 활발하게 사람들을 연결하고 있습니다.`
    },
    {
      key: "4",
      color: "#F9AB00",
      question: "뭔가 질문 하나 더..   ex.성비질문... ",
      answer: `2010년대부터 Google은 자사의 개발 언어와 기술들을 좋아하는 개발자, 비개발자들을 연결하여 커뮤니티를 만들고 커뮤니티 구성원들을 기반으로 더 많은 사람들이 연결되어 구글의 기술 생태계에 참여할 수 있길 바라왔습니다. 그렇게 한국을 포함한 전 세계 구글 본사에 구글 개발자 생태계 팀이 창설되었습니다. \n\n이후 Amazon, Microsoft, Apple 등의 빅테크 기업들도 줄지어 커뮤니티 생태계 구축에 힘쓰기 시작했습니다. 선두주자였던 Google 커뮤니티들은 현재까지도 전 세계에서 가장 큰 커뮤니티를 형성하고 활발하게 사람들을 연결하고 있습니다.`
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