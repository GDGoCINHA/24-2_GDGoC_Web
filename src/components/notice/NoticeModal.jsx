'use client';

import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';

export default function NoticeModal({ item, onClose }) {
    const isOpen = !!item;

    return (
        <Modal isOpen={isOpen} onOpenChange={(o) => { if (!o) onClose?.(); }} size="5xl" backdrop="blur" className="bg-[#1b1b1b] text-white">
            <ModalContent className="bg-[#1b1b1b] text-white max-h-[85vh] overflow-y-auto">
                {() => (
                    <div className="flex flex-col">
                        <ModalHeader className="px-6 pb-0 pt-6">
                            <h3 className="text-2xl font-bold">{item?.title}</h3>
                        </ModalHeader>

                        {/* 이미지: 세로 최대 높이 제한 */}
                        <div className="px-6 pt-4">
                            <div className="relative w-full h-[36vh] md:h-[42vh] rounded-xl overflow-hidden">
                                {item?.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                            </div>
                        </div>

                        {/* 상세 설명 | 소개글 */}
                        <ModalBody className="px-6 pb-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* 좌: 상세 설명(요약 카드 + 정보) */}
                                <div>
                                    <h4 className="font-semibold mb-2">상세 설명</h4>
                                    <div className="bg-[#222] rounded-xl p-4 space-y-4">
                                        <p className="text-gray-200 leading-7">{item?.summary}</p>
                                        <div className="border-t border-white/10 pt-3 text-sm space-y-2">
                                            <div className="flex"><span className="w-20 text-gray-300">기간</span><span className="text-gray-100">{item?.details?.period || '-'}</span></div>
                                            <div className="flex"><span className="w-20 text-gray-300">모집</span><span className="text-gray-100">{item?.details?.recruitment || '-'}</span></div>
                                            <div className="flex"><span className="w-20 text-gray-300">일정</span><span className="text-gray-100">{item?.details?.schedule || '-'}</span></div>
                                            <div className="flex"><span className="w-20 text-gray-300">장소</span><span className="text-gray-100">{item?.details?.location || '-'}</span></div>
                                            <div className="flex"><span className="w-20 text-gray-300">링크</span><a href={item?.details?.link || '#'} target="_blank" rel="noreferrer" className="text-blue-400 break-all hover:underline">{item?.details?.link || '-'}</a></div>
                                        </div>
                                    </div>
                                </div>
                                {/* 우: 소개글(줄글 Markdown) */}
                                <div>
                                    <h4 className="font-semibold mb-2">소개글</h4>
                                    {item?.md ? (
                                        <div className="prose prose-invert max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                                components={{
                                                    a: ({node, ...props}) => (
                                                        <a {...props} target="_blank" rel="noopener noreferrer" />
                                                    )
                                                }}
                                            >
                                                {item.md}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-gray-200 whitespace-pre-line leading-7">{item?.summary}</p>
                                    )}
                                </div>
                            </div>
                        </ModalBody>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
}




