const studyData = {
    studyCards: [
        {
            title: "블록체인 기초",
            description: "블록체인 기술의 기본부터 작동 원리와 실제 적용 사례까지 배워봅니다.",
            status: "진행 중",
            icon: "/src/images/google_icon.png",
            course: "official",  // Add this line
            studyCards: [
                {
                    title: "블록체인 소개",
                    description: "블록체인이란 무엇인가? 핵심 개념과 역사에 대해 배워봅니다.",
                    status: "completed",
                    icon: "/src/images/google_icon.png",
                    course: "official"  // Add this line
                },
                {
                    title: "스마트 계약",
                    description: "스마트 계약이 어떻게 블록체인에서 자동으로 실행되는 계약을 가능하게 하는지 알아봅니다.",
                    status: "not-started",
                    icon: "/src/images/google_icon.png",
                    course: "personal"  // Add this line
                },
                {
                    title: "합의 알고리즘",
                    description: "작업 증명(Proof of Work)과 지분 증명(Proof of Stake) 같은 다양한 합의 메커니즘을 배워봅니다.",
                    status: "in-progress",
                    icon: "/src/images/google_icon.png",
                    course: "official"  // Add this line
                },
                {
                    title: "블록체인 보안",
                    description: "블록체인의 보안 측면을 이해하고, 암호화와 데이터 무결성에 대해 알아봅니다.",
                    status: "pending",
                    icon: "/src/images/google_icon.png",
                    course: "personal"  // Add this line
                }
            ]
        },
        {
            title: "Web3 개발",
            description: "탈중앙화 애플리케이션과 Web3 기술에 대해 배워봅니다.",
            status: "미시작",
            icon: "/src/images/google_icon.png",
            course: "personal",  // Add this line
            studyCards: [
                {
                    title: "탈중앙화 애플리케이션 (dApp)",
                    description: "dApp이란 무엇인가? 탈중앙화 애플리케이션이 디지털 환경을 어떻게 변화시키는지 탐구합니다.",
                    status: "in-progress",
                    icon: "/src/images/google_icon.png",
                    course: "official"  // Add this line
                },
                {
                    title: "스마트 계약과 상호작용",
                    description: "Web3.js와 다른 라이브러리를 사용하여 스마트 계약과 상호작용하는 방법을 배워봅니다.",
                    status: "in-progress",
                    icon: "/src/images/google_icon.png",
                    course: "personal"  // Add this line
                },
                {
                    title: "React로 Web3 프론트엔드 만들기",
                    description: "React 애플리케이션에서 Web3 기능을 통합하는 방법을 배워봅니다.",
                    status: "pending",
                    icon: "/src/images/google_icon.png",
                    course: "official"  // Add this line
                },
                {
                    title: "Web3 보안 및 모범 사례",
                    description: "Web3 개발에서 흔히 발생하는 보안 위험과 이를 완화하는 방법을 알아봅니다.",
                    status: "pending",
                    icon: "/src/images/google_icon.png",
                    course: "personal"  // Add this line
                }
            ]
        },
        {
            title: "스마트 계약 개발",
            description: "스마트 계약을 블록체인 플랫폼에서 개발하고 배포하는 기술을 익혀봅니다.",
            status: "미시작",
            icon: "/src/images/google_icon.png",
            course: "official",  // Add this line
            studyCards: [
                {
                    title: "Solidity로 스마트 계약 작성하기",
                    description: "Solidity를 사용하여 효율적이고 안전한 스마트 계약을 작성하는 방법을 배워봅니다.",
                    status: "not-started",
                    icon: "/src/images/google_icon.png",
                    course: "personal"  // Add this line
                },
                {
                    title: "스마트 계약 테스트하기",
                    description: "Hardhat과 Truffle 같은 도구를 사용하여 스마트 계약을 테스트하는 방법을 배워봅니다.",
                    status: "not-started",
                    icon: "/src/images/google_icon.png",
                    course: "official"  // Add this line
                },
                {
                    title: "스마트 계약 배포하기",
                    description: "스마트 계약을 Ethereum 블록체인에 배포하는 방법을 배워봅니다.",
                    status: "completed",
                    icon: "/src/images/google_icon.png",
                    course: "official"  // Add this line
                },
                {
                    title: "배포된 계약과 상호작용하기",
                    description: "Web3.js와 ethers.js를 사용하여 배포된 스마트 계약과 상호작용하는 방법을 배워봅니다.",
                    status: "completed",
                    icon: "/src/images/google_icon.png",
                    course: "personal"  // Add this line
                }
            ]
        },
        {
            title: "암호화폐와 거래",
            description: "암호화폐의 세계를 이해하고 이를 거래하는 방법을 배워봅니다.",
            status: "미시작",
            icon: "/src/images/google_icon.png",
            course: "official",  // Add this line
            studyCards: [
                {
                    title: "암호화폐 기초",
                    description: "암호화폐의 기본 개념과 전통적인 화폐와의 차이점에 대해 배워봅니다.",
                    status: "not-started",
                    icon: "/src/images/google_icon.png",
                    course: "personal"  // Add this line
                },
                {
                    title: "암호화폐 지갑과 보안",
                    description: "암호화폐 지갑의 종류와 자산을 안전하게 지키는 방법에 대해 알아봅니다.",
                    status: "completed",
                    icon: "/src/images/google_icon.png",
                    course: "official"  // Add this line
                },
                {
                    title: "암호화폐 시장과 거래소",
                    description: "암호화폐 시장이 어떻게 작동하는지, 다양한 거래소에서 거래하는 방법을 배워봅니다.",
                    status: "pending",
                    icon: "/src/images/google_icon.png",
                    course: "personal"  // Add this line
                },
                {
                    title: "암호화폐 거래를 위한 기술적 분석",
                    description: "암호화폐 거래 결정을 내리기 위한 기술적 분석 기법을 배워봅니다.",
                    status: "not-started",
                    icon: "/src/images/google_icon.png",
                    course: "official"  // Add this line
                }
            ]
        }
    ]
};

export default studyData;