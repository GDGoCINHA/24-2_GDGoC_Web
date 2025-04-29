## 목차

## 소개

이 문서는 Next.js App Router 기반 프로젝트 구조 규칙을 정의합니다. 모든 팀원이 일관된 코드 구조를 유지하여 협업 효율성을 높이는 것이 목적입니다. Next.js 공식 문서와 권장 사항을 기반으로 작성되었습니다.

## 기본 디렉토리 구조

```
project-root/
├── .github/                # GitHub 설정
├── .husky/                 # Git hook 설정
├── src/                    # 소스 코드 루트
│   ├── app/                # App Router 엔트리 (페이지, 레이아웃 등)
│   ├── components/         # 공통 컴포넌트
│   │   ├── ui/             # UI 컴포넌트
│   │   └── shared/         # 공유 컴포넌트
│   ├── hooks/              # 커스텀 훅
│   ├── lib/                # 유틸리티 함수, 공통 로직
│   ├── store/              # 상태 관리
│   └── types/              # 타입 정의
├── public/                 # 정적 파일
├── .env.local              # 로컬 환경 변수
├── .env.example            # 환경 변수 예시
├── .eslintrc.js            # ESLint 설정
├── .prettierrc             # Prettier 설정
├── next.config.js          # Next.js 설정
├── package.json            # 패키지 정보 및 스크립트
├── tailwind.config.js      # Tailwind CSS 설정
├── postcss.config.js       # PostCSS 설정
├── jest.config.js          # Jest 테스트 설정
└── tsconfig.json           # TypeScript 설정
```

> 참고: src 디렉토리는 선택 사항이지만, 코드 구조를 더 명확하게 분리하는 데 도움이 됩니다. Next.js는 src/app, src/pages, src/components 등의 구조를 공식적으로 지원합니다.

출처: Next.js 공식 문서 - Project Organization
>

## 라우팅 규칙

### App Router 기본 규칙

App Router는 파일 시스템 기반 라우팅을 사용합니다. 다음 규칙을 준수합니다:

1. **특별한 파일명**
    - `page.js` / `page.tsx`: 라우트 UI 정의 및 접근 가능한 경로 생성
    - `layout.js` / `layout.tsx`: 중첩 레이아웃 정의
    - `template.js` / `template.tsx`: 재렌더링되는 레이아웃
    - `loading.js` / `loading.tsx`: 로딩 UI (Suspense 기반)
    - `error.js` / `error.tsx`: 에러 UI (Error Boundary)
    - `not-found.js` / `not-found.tsx`: 404 페이지
    - `route.js` / `route.ts`: API endpoints
    - `default.js` / `default.tsx`: 병렬 라우트의 대체 UI
    - `middleware.ts`: 글로벌 미들웨어 정의
2. **라우트 그룹화**
    - 괄호 `(folder)` 사용: `(groupName)/`
    - URL에 영향을 주지 않으면서 라우트 구성 가능
    - 관련 기능별로 코드 구성 용이
3. **동적 라우팅**
    - `[param]`: 동적 세그먼트
    - `[...param]`: 캐치올 세그먼트 (여러 경로 세그먼트 포함)
    - `[[...param]]`: 선택적 캐치올 세그먼트 (매개변수 없어도 일치)
4. **병렬 라우트**
    - `@folder`: 동일 URL에서 여러 페이지를 병렬로 표시
    - 대시보드, 모달 등에 유용
5. **인터셉트 라우트**
    - `(..)folder`, `(...)folder`: 현재 레이아웃 내에서 다른 라우트 렌더링
    - 모달 UI 패턴 구현에 유용

> 출처: Next.js 공식 문서 - Routing
>

### 프로젝트 라우팅 구조

```
src/app/
├── (routes)/
│   ├── page.tsx                      # 홈페이지 (/)
│   ├── layout.tsx                    # 루트 레이아웃
│   ├── about/
│   │   └── page.tsx                  # /about
│   ├── (auth)/                       # 인증 관련 라우트 그룹
│   │   ├── login/
│   │   │   └── page.tsx              # /login
│   │   └── signup/
│   │       └── page.tsx              # /signup
│   ├── dashboard/
│   │   ├── layout.tsx                # 대시보드 레이아웃
│   │   ├── page.tsx                  # /dashboard
│   │   ├── @stats/                   # 병렬 라우트
│   │   │   └── page.tsx
│   │   └── @notifications/           # 병렬 라우트
│   │       └── page.tsx
│   ├── products/
│   │   ├── page.tsx                  # /products
│   │   └── [productId]/              # /products/[productId]
│   │       ├── page.tsx
│   │       ├── reviews/
│   │       │   └── page.tsx          # /products/[productId]/reviews
│   │       └── (.)edit/              # 인터셉트 라우트 (모달)
│   │           └── page.tsx
│   └── profile/
│       ├── [userId]/                 # 동적 라우트
│       │   └── page.tsx              # /profile/[userId]
│       └── page.tsx                  # /profile
├── api/                              # API endpoints
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts              # /api/auth/... (NextAuth.js)
│   └── users/
│       └── route.ts                  # /api/users
└── middleware.ts                     # 글로벌 미들웨어
```

> 참고: 위 구조는 App Router의 다양한 라우팅 기능을 활용한 예시입니다. 실제 프로젝트에서는 필요에 따라 조정할 수 있습니다.

출처: Next.js 공식 문서 - Advanced Routing Patterns
>

## 컴포넌트 구조화

### 컴포넌트 디렉토리 구조

```
src/components/
├── ui/                        # 기본 UI 컴포넌트
│   ├── button/
│   │   ├── button.tsx
│   │   ├── button.test.tsx
│   │   └── index.ts          # 내보내기 지점
│   ├── card/
│   └── input/
├── shared/                    # 여러 페이지에서 사용되는 공유 컴포넌트
│   ├── header/
│   ├── footer/
│   └── sidebar/
├── [feature-name]/            # 특정 기능별 컴포넌트
│   └── [component-name]/
└── providers/                 # Context 제공자 컴포넌트
    ├── theme-provider.tsx
    └── session-provider.tsx
```

### 컴포넌트 네이밍 규칙

1. **파스칼 케이스(PascalCase)** 사용: `Button.tsx`, `UserCard.tsx`
2. **의미있는 이름** 사용: 컴포넌트의 기능이나 목적을 명확히 표현
3. **일관된 접미사** 사용: `List`, `Item`, `Card`, `Form`, `Modal` 등
4. **내보내기 파일**: `index.ts`에서 모든 컴포넌트 내보내기로 간결한 임포트 지원

### 컴포넌트 구현 지침

1. **단일 책임 원칙**: 각 컴포넌트는 하나의 책임만 가집니다.
2. **컴포넌트 크기**: 300줄 이상 커지면 분할을 고려합니다.
3. **Props 인터페이스**: 모든 컴포넌트의 props는 분명한 인터페이스를 정의합니다.
4. **기본값 설정**: props에 적절한 기본값을 제공합니다.
5. **클라이언트/서버 컴포넌트 구분**: ‘use client’ 지시어를 명확히 사용합니다.

```tsx
// components/ui/button/button.tsx
'use client'; // 클라이언트 컴포넌트 표시

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// 버튼 스타일 변형 정의
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Props 정의
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// Button 컴포넌트 구현
export function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? React.Slot : 'button';
  return (
    <Comp
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </Comp>
  );
}
```

> 참고: 위 예시는 shadcn/ui와 Next.js 권장 방식을 따른 컴포넌트 구현 방법입니다.
>

### 서버 컴포넌트와 클라이언트 컴포넌트 구분

App Router는 기본적으로 React 서버 컴포넌트(RSC)를 사용합니다. 상태, 이벤트 리스너 등 클라이언트 기능이 필요한 경우에만 ‘use client’ 지시어를 사용합니다.

```tsx
// 서버 컴포넌트 (기본값)
// src/components/user-profile.tsx
import { getUserData } from '@/lib/api';

export async function UserProfile({ userId }: { userId: string }) {
  const userData = await getUserData(userId);
  return (
    <div>
      <h1>{userData.name}</h1>
      <p>{userData.bio}</p>
    </div>
  );
}
```

```tsx
// 클라이언트 컴포넌트
// src/components/interactive-form.tsx
'use client';
import { useState } from 'react';

export function InteractiveForm() {
  const [formData, setFormData] = useState({});
  // 클라이언트 이벤트 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    // 폼 제출 로직
  };
  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드 */}
    </form>
  );
}
```

> 출처: Next.js 공식 문서 - Server and Client Components
>

## 상태 관리

### 로컬 상태

- React 내장 `useState`, `useReducer` 훅 사용
- 컴포넌트 내부에서만 관리되는 UI 상태에 적합
- 복잡한 폼 상태는 `react-hook-form` 같은 라이브러리 고려

### 글로벌 상태

Next.js에서는 다양한 상태 관리 접근법을 사용할 수 있습니다:

1. **Context API**: 간단한 전역 상태에 적합
2. **Zustand**: 가볍고 직관적인 상태 관리 (권장)
3. **Jotai**: 원자적(atomic) 상태 관리
4. **Redux Toolkit**: 복잡한 상태 로직이 필요한 대규모 애플리케이션

```
src/store/
├── index.ts           # 스토어 내보내기
├── useUserStore.ts    # 사용자 관련 상태
├── useCartStore.ts    # 장바구니 관련 상태
└── useThemeStore.ts   # 테마 관련 상태
```

### Zustand 스토어 예시

```tsx
// src/store/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user }),
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // API 호출 로직
          const user = await loginApi(email, password);
          set({ user, isLoading: false });
        } catch (err) {
          set({ error: err.message, isLoading: false });
        }
      },
      logout: () => {
        // 로그아웃 로직
        set({ user: null });
      },
    }),
    {
      name: 'user-storage', // localStorage 키 이름
    }
  )
);

```

### 상태 관리 규칙

1. **최소한의 글로벌 상태**: 정말 필요한 상태만 글로벌로 관리
2. **타입 안전성**: 모든 상태는 명확한 타입 정의
3. **상태 분리**: 관심사 분리 원칙에 따라 상태 관리 분리
4. **서버 컴포넌트 고려**: 서버 컴포넌트에서는 클라이언트 상태에 직접 접근 불가

> 출처: Next.js 공식 문서 - Data Fetching
>

## API 통신

### API 클라이언트 구조

```
src/lib/
├── api/
│   ├── client.ts          # 기본 API 클라이언트 설정
│   ├── endpoints.ts       # API 엔드포인트 상수
│   └── services/
│       ├── userService.ts
│       └── productService.ts
```

### API 통신 방법

Next.js App Router에서는 여러 데이터 가져오기 방법을 제공합니다:

1. **서버 컴포넌트에서 직접 가져오기**: `async/await` 사용
2. **Route Handlers 사용**: API 엔드포인트 구현
3. **Server Actions 사용**: 폼 제출 등의 변형 처리
4. **클라이언트 컴포넌트**: `SWR` 또는 `React Query` 사용

### 서버 컴포넌트 데이터 가져오기 예시

```tsx
// src/app/products/[title]/page.tsx
import { getProduct } from '@/lib/api/services/productService';
import { ProductDetails } from '@/components/products/product-details';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  return <ProductDetails product={product} />;
}

```

### API 클라이언트 설정

```tsx
// src/lib/api/client.ts
import { API_BASE_URL } from '@/lib/constants';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    // 기본적으로 쿠키 포함
    credentials: 'include',
    // 캐시 전략
    next: {
      revalidate: 60, // 60초마다 재검증
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(error, response.status);
  }

  return response.json();
}

```

### 서비스 함수 예시

```tsx
// src/lib/api/services/userService.ts
import { fetchApi } from '../client';
import { User, UserResponse } from '@/types/user';

export async function getUser(id: string): Promise<User> {
  try {
    const data = await fetchApi<UserResponse>(`/users/${id}`);
    return data.user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  try {
    const data = await fetchApi<UserResponse>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    return data.user;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
}

```

### Server Actions 사용

```tsx
// src/app/products/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  // 서버 측 유효성 검사
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);

  if (!name || isNaN(price)) {
    return { error: '유효하지 않은 입력입니다.' };
  }

  try {
    // 데이터베이스 작업 또는 API 호출
    await db.products.create({ data: { name, price } });

    // 캐시 무효화
    revalidatePath('/products');
    redirect('/products');
  } catch (error) {
    return { error: '제품 생성 실패' };
  }
}

```

> 출처: Next.js 공식 문서 - Data Fetching, Caching, and Revalidating
>

## 스타일링

Next.js App Router는 여러 스타일링 방법을 지원합니다:

### CSS 모듈

- 컴포넌트 스코프 CSS
- 네이밍 충돌 방지
- 파일명: `[component-name].module.css`

```css
/* src/components/ui/card/card.module.css */
.card {
  border-radius: 0.5rem;  
  padding: 1.5rem;  
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.cardTitle {
  font-size: 1.25rem;  
  font-weight: 600;  
  margin-bottom: 0.5rem;
}
```

```tsx
// src/components/ui/card/card.tsx
import styles from './card.module.css';

export function Card({ title, children }) {
  return (
    <div className={styles.card}>
      {title && <h3 className={styles.cardTitle}>{title}</h3>}
      {children}
    </div>
  );
}

```

### Tailwind CSS

- 유틸리티 우선 CSS 프레임워크
- 빠른 개발 속도
- 일관된 디자인 시스템

```tsx
// src/components/ui/card/card.tsx
export function Card({ title, children }) {
  return (
    <div className="rounded-lg p-6 shadow-md bg-white dark:bg-gray-800">
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      <div>{children}</div>
    </div>
  );
}

```

### Tailwind CSS 구성

```jsx
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // 추가 색상...
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### CSS-in-JS 라이브러리

- Styled Components, Emotion 등
- 동적 스타일링에 유용
- 주의: 서버 컴포넌트에서는 추가 설정 필요

### 스타일링 권장 사항

1. **일관성 유지**: 프로젝트 전체에서 하나의 스타일링 방식 사용
2. **디자인 시스템**: 색상, 간격, 타이포그래피 등 변수화
3. **반응형 디자인**: 모바일 우선 접근법으로 일관된 브레이크포인트 사용
4. **다크 모드**: 색상 변수 및 테마 지원 설계

> 출처: Next.js 공식 문서 - Styling
>

## 테스트

### 테스트 디렉토리 구조

```
src/
├── __tests__/                  # 전역 테스트
│   ├── integration/
│   └── utils/
└── components/
    └── ui/
        └── button/
            ├── button.tsx
            └── button.test.tsx  # 컴포넌트별 테스트
```

### 테스트 도구

1. **Jest**: JavaScript 테스트 프레임워크
2. **React Testing Library**: 컴포넌트 테스트
3. **Cypress**: E2E 테스트
4. **Playwright**: 현대적 E2E 테스트 대안 (Next.js 팀 권장)
5. **Vitest**: Jest 호환 빠른 테스트 러너 (대안)

### 테스트 유형

1. **단위 테스트**: 개별 함수, 유틸리티, 훅
2. **컴포넌트 테스트**: UI 컴포넌트의 렌더링과 상호작용
3. **통합 테스트**: 여러 컴포넌트 또는 기능의 상호작용
4. **E2E 테스트**: 실제 브라우저에서의 사용자 시나리오
5. **스냅샷 테스트**: UI 변경 사항 감지

### 컴포넌트 테스트 예시

```tsx
// src/components/ui/button/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

```

### Jest 설정

```jsx
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // next.config.js와 .env 파일이 있는 위치
  dir: './',
});

// Jest에 전달할 설정
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testMatch: ['**/__tests__/**/*.test.(js|jsx|ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!**/node_modules/**',
  ],
};

// createJestConfig는 Next.js의 설정을 사용하여 Jest 설정을 생성
module.exports = createJestConfig(customJestConfig);
```

## 국제화 (Internationalization)

Next.js App Router는 국제화를 기본적으로 지원합니다. 다음과 같이 구성합니다:

### 설정 방법

1. `next.config.js` 파일에 국제화 설정 추가:

```jsx
// next.config.jsmodule.exports = {
  i18n: {
    locales: ['en', 'ko'],    
    defaultLocale: 'ko'
  }
};
```

1. URL 경로에 따라 로케일 자동 전환을 지원합니다.
2. 클라이언트 컴포넌트에서는 `useLocale` 훅을 사용하여 현재 로케일 정보를 가져올 수 있습니다.

> 출처: Next.js 공식 문서 - Internationalization
>

---

## 메타데이터 및 SEO

Next.js App Router에서는 `metadata` 객체를 통해 SEO 정보를 설정할 수 있습니다.

### 페이지 메타데이터 설정

```tsx
// src/app/(routes)/about/page.tsx
export const metadata = {
  title: 'About Us - MyApp',
  description: 'Learn more about MyApp and our mission.',
  openGraph: {
    title: 'About Us - MyApp',
    description: 'Learn more about MyApp and our mission.',
    url: 'https://myapp.com/about',
    siteName: 'MyApp',
    images: [
      {
        url: 'https://myapp.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};
```

- SEO를 강화하기 위해 `robots.txt`, `sitemap.xml`도 추가하는 것을 권장합니다.
- `next-sitemap` 패키지를 사용해 sitemap을 자동 생성할 수 있습니다.

> 출처: Next.js 공식 문서 - Metadata
>

---

## 성능 최적화

Next.js App Router는 성능을 최우선으로 고려합니다. 주요 최적화 방법은 다음과 같습니다:

### 코드 스플리팅

- App Router는 페이지 단위로 자동 코드 분할(code splitting)을 수행합니다.

### 이미지 최적화

- `next/image`를 사용하여 자동 이미지 최적화 적용.

```tsx
import Image from 'next/image';

export function HeroBanner() {
  return (
    <Image
      src="/banner.jpg"
      alt="Banner"
      width={1200}
      height={600}
      priority
    />
  );
}
```

### 캐싱 및 재검증

- `fetch` 함수의 `next` 옵션을 사용하여 캐시 전략을 설정할 수 있습니다.

```tsx
await fetch('/api/data', { next: { revalidate: 60 } });
```

> 출처: Next.js 공식 문서 - Performance Best Practices (구버전)
>

---

## 에러 핸들링 (Error Handling)

Next.js App Router는 에러 처리를 페이지 단위로 분리하여 구조화할 수 있습니다.

### 에러 페이지 기본 사용법

- `error.tsx` 파일을 통해 각 경로별 에러 UI를 정의할 수 있습니다.

예시:

```tsx
'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">문제가 발생했습니다.</h2>
      <button
        className="px-4 py-2 bg-primary text-white rounded"
        onClick={() => reset()}
      >
        다시 시도
      </button>
    </div>
  );
}
```

- `reset()`을 호출하면 에러 상태를 초기화하고 재시도할 수 있습니다.
- 에러는 **자동으로 상위 레이아웃의 error.tsx**까지 전파됩니다.

### 글로벌 에러 핸들링

- `/src/app/error.tsx` 파일을 사용하여 앱 전체의 에러를 처리할 수 있습니다.
- 서버 측 에러(예: 데이터 페칭 실패)도 포착할 수 있습니다.

### 에러 핸들링 베스트 프랙티스

- 의미 있는 에러 메시지를 사용자에게 표시합니다.
- 가능하다면 복구 가능한 경로를 제공합니다 (ex: 재시도 버튼).
- 서버 액션에서는 에러를 명시적으로 반환하고, 클라이언트에서 후처리합니다.

> 출처: Next.js 공식 문서 - Handling Errors
>

---

## Server Actions 고급 사용법

Next.js App Router에서는 서버 액션을 통해 폼 제출과 변형 작업을 서버에서 직접 처리할 수 있습니다.

### 기본 예시

```jsx
'use server'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;  
  const price = parseFloat(formData.get('price') as string);  
  
  if (!name || isNaN(price)) {
    return { error: '유효하지 않은 입력입니다.' };  
  }
  
  try {
    await db.products.create({ data: { name, price } });    
	  revalidatePath('/products');    
	  redirect('/products');  
  } catch (error) {
	  return { error: '제품 생성 실패' };
	}
}
```

### 주의사항

- 서버 액션은 반드시 ‘use server’ 디렉티브로 선언합니다.
- Server Actions는 Form 기반 UI와 잘 결합됩니다.
- Server Actions는 클라이언트 컴포넌트에서 직접 호출할 수 없습니다.

> 출처: Next.js 공식 문서 - Server Actions
>

---

## Middleware 고급 구성

Next.js App Router에서는 `middleware.ts`를 이용하여 요청을 가로채고 수정할 수 있습니다.

### 기본 예시

```tsx
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
    
  if (pathname.startsWith('/admin')) {
    const isAuthenticated = checkAuth(request);
        
    if (!isAuthenticated) {
	    return NextResponse.redirect(new URL('/login', request.url));    
	  }
  }
  return NextResponse.next();
}
```

### 고급 사용

- 국제화와 지역별 콘텐츠 제공 시 `request.nextUrl.locale`을 사용
- 특정 경로를 조건부 리디렉션하거나 차단 가능
- Middleware는 Edge Runtime에서 동작하므로 가벼워야 합니다.

> 출처: Next.js 공식 문서 - Middleware
>

---

## 레퍼런스

- [Next.js 공식 문서 - Project Organization](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js 공식 문서 - Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js 공식 문서 - Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js 공식 문서 - Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js 공식 문서 - Styling](https://nextjs.org/docs/app/getting-started/css)
- [Next.js 공식 문서 - Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js 공식 문서 - Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Next.js 공식 문서 - Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Next.js 공식 문서 - Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js 공식 문서 - Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js 공식 문서 - Rendering](https://nextjs.org/docs/app/building-your-application/rendering)
- [Next.js 공식 문서 - Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Next.js 공식 문서 - Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)