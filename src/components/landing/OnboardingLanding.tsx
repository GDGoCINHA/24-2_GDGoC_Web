'use client'

import gsap from 'gsap'
import { ChevronDown, ChevronRight, CircleHelp, LogOut, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  type TouchEvent,
  type WheelEvent
} from 'react'

import { GdgButton, GdgLogo } from '@/components/ui/design-system'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

import onboardingBg from '@public/images/onboarding/onboarding_bg.png'
import onboardingBgMobile from '@public/images/onboarding/onboarding_bg_mobile.png'

type Accent = 'red' | 'green' | 'blue' | 'yellow'

const accentClass: Record<Accent, string> = {
  red: 'bg-red text-red',
  green: 'bg-green text-green',
  blue: 'bg-blue text-blue',
  yellow: 'bg-yellow text-yellow'
}

const valueTagStateClass: Record<Accent, { active: string; inactive: string }> = {
  red: { active: 'bg-red', inactive: 'bg-red-400' },
  green: { active: 'bg-green', inactive: 'bg-green-400' },
  blue: { active: 'bg-blue', inactive: 'bg-blue-400' },
  yellow: { active: 'bg-yellow', inactive: 'bg-yellow-400' }
}

const navItems = [
  { label: '소개', id: 'about' },
  { label: '활동', id: 'activities' },
  { label: 'FAQ', id: 'faq' }
]

const getActiveNavIndex = (activeId: string) => {
  if (activeId === 'faq') return 2
  if (activeId === 'activities' || activeId === 'join') return 1
  return 0
}

const stats = [
  { label: '누적 참여 인원', value: 500 },
  { label: '활동 멤버', value: 200 },
  { label: '진행한 스터디/프로젝트', value: 100 },
  { label: '진행한 이벤트/행사', value: 50 }
]

const values: Array<{ title: string; body: string; accent: Accent }> = [
  { title: '함께', body: '팀으로 배우고 만들며\n더 멀리 나아가요.', accent: 'red' },
  { title: '공유', body: '지식과 경험을 나누며\n함께 나아가요.', accent: 'green' },
  { title: '성장', body: '도전하며\n한 단계씩 성장해요.', accent: 'blue' },
  { title: '존중', body: '서로의 관점과 속도를\n존중해요.', accent: 'yellow' }
]

const ROLE_RANK: Record<string, number> = {
  GUEST: 0,
  MEMBER: 1,
  CORE: 2,
  LEAD: 3,
  ORGANIZER: 4,
  ADMIN: 5
}

function SeminarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19.6875 5.25H4.3125C4.00184 5.25 3.75 5.50184 3.75 5.8125V14.4375C3.75 14.7482 4.00184 15 4.3125 15H19.6875C19.9982 15 20.25 14.7482 20.25 14.4375V5.8125C20.25 5.50184 19.9982 5.25 19.6875 5.25Z"
        fill="currentColor"
      />
      <path
        d="M20.25 3H12.75V2.25C12.75 2.05109 12.671 1.86032 12.5303 1.71967C12.3897 1.57902 12.1989 1.5 12 1.5C11.8011 1.5 11.6103 1.57902 11.4697 1.71967C11.329 1.86032 11.25 2.05109 11.25 2.25V3H3.75C3.15345 3.00062 2.58152 3.23787 2.1597 3.6597C1.73787 4.08152 1.50062 4.65345 1.5 5.25V15C1.50062 15.5965 1.73787 16.1685 2.1597 16.5903C2.58152 17.0121 3.15345 17.2494 3.75 17.25H5.75578L4.52906 21.5438C4.49979 21.6391 4.48982 21.7393 4.49973 21.8385C4.50964 21.9377 4.53923 22.0339 4.58678 22.1216C4.63433 22.2092 4.69888 22.2865 4.77665 22.3489C4.85443 22.4113 4.94386 22.4576 5.03973 22.485C5.13559 22.5124 5.23596 22.5205 5.33497 22.5086C5.43398 22.4968 5.52963 22.4654 5.61634 22.4161C5.70305 22.3669 5.77907 22.3009 5.83995 22.2219C5.90084 22.1429 5.94537 22.0526 5.97094 21.9562L7.31578 17.25H11.25V19.5C11.25 19.6989 11.329 19.8897 11.4697 20.0303C11.6103 20.171 11.8011 20.25 12 20.25C12.1989 20.25 12.3897 20.171 12.5303 20.0303C12.671 19.8897 12.75 19.6989 12.75 19.5V17.25H16.6842L18.0291 21.9562C18.0546 22.0526 18.0992 22.1429 18.16 22.2219C18.2209 22.3009 18.297 22.3669 18.3837 22.4161C18.4704 22.4654 18.566 22.4968 18.665 22.5086C18.764 22.5205 18.8644 22.5124 18.9603 22.485C19.0561 22.4576 19.1456 22.4113 19.2233 22.3489C19.3011 22.2865 19.3657 22.2092 19.4132 22.1216C19.4608 22.0339 19.4904 21.9377 19.5003 21.8385C19.5102 21.7393 19.5002 21.6391 19.4709 21.5438L18.2442 17.25H20.25C20.8465 17.2494 21.4185 17.0121 21.8403 16.5903C22.2621 16.1685 22.4994 15.5965 22.5 15V5.25C22.4994 4.65345 22.2621 4.08152 21.8403 3.6597C21.4185 3.23787 20.8465 3.00062 20.25 3ZM21 15C21 15.1989 20.921 15.3897 20.7803 15.5303C20.6397 15.671 20.4489 15.75 20.25 15.75H3.75C3.55109 15.75 3.36032 15.671 3.21967 15.5303C3.07902 15.3897 3 15.1989 3 15V5.25C3 5.05109 3.07902 4.86032 3.21967 4.71967C3.36032 4.57902 3.55109 4.5 3.75 4.5H20.25C20.4489 4.5 20.6397 4.57902 20.7803 4.71967C20.921 4.86032 21 5.05109 21 5.25V15Z"
        fill="currentColor"
      />
    </svg>
  )
}

function StudyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9.48 3.46889C7.78641 2.66029 5.41922 2.2642 2.25 2.25014C1.95111 2.24607 1.65809 2.33323 1.41 2.49998C1.20637 2.63762 1.03968 2.82319 0.924597 3.04036C0.809512 3.25754 0.749555 3.49966 0.750002 3.74545V17.1564C0.750002 18.0629 1.395 18.7469 2.25 18.7469C5.58141 18.7469 8.92313 19.0581 10.9247 20.95C10.9521 20.976 10.9865 20.9934 11.0237 21C11.0608 21.0066 11.0991 21.0021 11.1338 20.9871C11.1684 20.9721 11.1979 20.9473 11.2186 20.9157C11.2393 20.8841 11.2502 20.8471 11.25 20.8094V5.00732C11.2501 4.90071 11.2273 4.79532 11.1831 4.69828C11.139 4.60124 11.0745 4.5148 10.9941 4.44482C10.5356 4.05287 10.0263 3.72459 9.48 3.46889Z"
        fill="currentColor"
      />
      <path
        d="M22.59 2.49861C22.3418 2.33227 22.0488 2.24561 21.75 2.25017C18.5808 2.26423 16.2136 2.65845 14.52 3.46892C13.9737 3.72417 13.4643 4.0518 13.0055 4.44298C12.9252 4.51309 12.8609 4.59955 12.8168 4.69657C12.7728 4.7936 12.75 4.89893 12.75 5.00548V20.8085C12.75 20.8447 12.7607 20.8802 12.7807 20.9104C12.8008 20.9407 12.8293 20.9643 12.8628 20.9784C12.8962 20.9924 12.9331 20.9963 12.9687 20.9895C13.0044 20.9827 13.0372 20.9656 13.0631 20.9402C14.2664 19.7449 16.3781 18.7455 21.7519 18.746C22.1497 18.746 22.5312 18.5879 22.8125 18.3066C23.0938 18.0253 23.2519 17.6438 23.2519 17.246V3.74595C23.2524 3.49968 23.1923 3.25707 23.0769 3.03953C22.9615 2.82199 22.7942 2.63621 22.59 2.49861Z"
        fill="currentColor"
      />
    </svg>
  )
}

function NetworkingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19.424 4.58174C18.4507 3.59885 17.2928 2.81795 16.0169 2.28389C14.7409 1.74984 13.372 1.47316 11.9887 1.46976C10.6055 1.46635 9.23524 1.73629 7.95666 2.26405C6.67807 2.79182 5.51636 3.56702 4.53827 4.54511C3.56018 5.5232 2.78498 6.6849 2.25722 7.96349C1.72945 9.24208 1.45952 10.6123 1.46292 11.9956C1.46633 13.3788 1.743 14.7477 2.27706 16.0237C2.81111 17.2997 3.59201 18.4575 4.57491 19.4308C5.54817 20.4137 6.70605 21.1946 7.98202 21.7287C9.258 22.2627 10.6269 22.5394 12.0101 22.5428C13.3934 22.5462 14.7636 22.2763 16.0422 21.7485C17.3208 21.2207 18.4825 20.4455 19.4606 19.4674C20.4387 18.4894 21.2139 17.3276 21.7417 16.0491C22.2694 14.7705 22.5394 13.4002 22.536 12.017C22.5325 10.6338 22.2559 9.26483 21.7218 7.98886C21.1878 6.71289 20.4069 5.55501 19.424 4.58174ZM2.99944 12.0063C2.9991 11.2097 3.10471 10.4167 3.3135 9.64799C3.65756 10.3886 4.15725 11.0285 4.49709 11.7883C4.93631 12.7652 6.11569 12.4942 6.63647 13.3502C7.09866 14.11 6.60506 15.071 6.951 15.866C7.20225 16.443 7.79475 16.5691 8.2035 16.991C8.62116 17.4166 8.61225 17.9997 8.676 18.5547C8.74794 19.2068 8.86462 19.8532 9.02522 20.4892C9.02522 20.4939 9.02522 20.4991 9.02897 20.5038C5.52131 19.2719 2.99944 15.9283 2.99944 12.0063ZM11.9994 21.0063C11.4968 21.0061 10.9951 20.9641 10.4994 20.8806C10.5046 20.7536 10.5069 20.635 10.5196 20.5525C10.6335 19.8072 11.0066 19.0783 11.5101 18.5205C12.0074 17.9702 12.689 17.598 13.109 16.9736C13.5205 16.3642 13.6438 15.5439 13.4741 14.8319C13.2243 13.78 11.7951 13.4289 11.0244 12.8585C10.5815 12.5303 10.1873 12.0231 9.60553 11.9819C9.33741 11.9631 9.11288 12.0208 8.84709 11.9524C8.60334 11.8891 8.41209 11.7578 8.15241 11.7921C7.66725 11.8558 7.36116 12.3742 6.83991 12.3039C6.34538 12.2378 5.83584 11.6589 5.72334 11.1878C5.57897 10.5822 6.05803 10.3858 6.57131 10.3319C6.78553 10.3094 7.026 10.285 7.23178 10.3638C7.50272 10.4641 7.63069 10.7294 7.87397 10.8635C8.33006 11.1138 8.42241 10.7139 8.35256 10.3089C8.24803 9.70237 8.12616 9.45534 8.66709 9.03768C9.04209 8.74987 9.36272 8.54174 9.30272 8.02471C9.26709 7.72096 9.10069 7.58362 9.25584 7.28127C9.3735 7.05112 9.69647 6.84346 9.90694 6.70612C10.4502 6.35174 12.2343 6.37799 11.5054 5.38612C11.2912 5.09502 10.896 4.57471 10.521 4.50346C10.0523 4.41487 9.84413 4.93799 9.51741 5.16862C9.17991 5.40721 8.52272 5.67815 8.18475 5.30924C7.73006 4.81284 8.48616 4.65018 8.6535 4.30331C8.73084 4.14159 8.6535 3.91706 8.52319 3.70565C8.69225 3.6344 8.86413 3.56831 9.03881 3.50737C9.14829 3.58823 9.27816 3.63693 9.41381 3.64799C9.72741 3.66862 10.0232 3.49893 10.2969 3.71268C10.6007 3.94706 10.8196 4.24331 11.2227 4.31643C11.6127 4.38721 12.0257 4.15987 12.1223 3.76049C12.1808 3.51768 12.1223 3.26127 12.066 3.01049C13.8191 3.02058 15.5307 3.54561 16.9879 4.52034C16.8941 4.48471 16.7821 4.48893 16.6438 4.55315C16.3593 4.68534 15.9562 5.0219 15.9229 5.35565C15.8849 5.7344 16.4437 5.78784 16.709 5.78784C17.1074 5.78784 17.511 5.60971 17.3826 5.1494C17.3268 4.94971 17.2508 4.74206 17.1285 4.61643C17.4226 4.8205 17.7043 5.04183 17.9723 5.27924C17.968 5.28346 17.9638 5.28721 17.9596 5.2919C17.6896 5.57315 17.376 5.79581 17.1913 6.13799C17.061 6.37893 16.9143 6.49331 16.6504 6.55565C16.5051 6.58987 16.3391 6.60252 16.2173 6.70002C15.8779 6.96721 16.071 7.6094 16.3926 7.80206C16.799 8.04534 17.4018 7.93096 17.7083 7.58362C17.9479 7.31174 18.089 6.83971 18.5198 6.84018C18.7094 6.83979 18.8916 6.91404 19.0269 7.0469C19.2051 7.23159 19.1699 7.40409 19.2079 7.63471C19.2749 8.0444 19.6363 7.82221 19.8562 7.61549C20.0164 7.90069 20.161 8.19441 20.2893 8.49534C20.0474 8.84362 19.8552 9.22331 19.2735 8.81737C18.9252 8.57409 18.711 8.22112 18.2737 8.11143C17.8916 8.01768 17.5002 8.11518 17.1229 8.18034C16.694 8.25487 16.1854 8.28768 15.8601 8.61252C15.5455 8.92565 15.3791 9.34471 15.0444 9.65924C14.3971 10.2686 14.1238 10.9338 14.5429 11.7953C14.946 12.6236 15.7893 13.0731 16.6991 13.0141C17.593 12.9546 18.5216 12.4361 18.4958 13.735C18.4865 14.1949 18.5826 14.5131 18.7237 14.9402C18.8544 15.3339 18.8455 15.7155 18.8755 16.1219C18.9041 16.5978 18.9785 17.0698 19.0977 17.5314C18.2575 18.6132 17.1812 19.4886 15.951 20.0909C14.7208 20.6931 13.3692 21.0062 11.9994 21.0063Z"
        fill="currentColor"
      />
    </svg>
  )
}

function EventIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18.3279 14.4037C19.863 12.2311 20.5118 9.63982 20.156 7.10622C20.0051 6.03448 19.6446 5.00295 19.095 4.07053C18.5455 3.13811 17.8176 2.32307 16.9531 1.67194C16.0885 1.02081 15.1042 0.546346 14.0563 0.275635C13.0084 0.00492412 11.9174 -0.05673 10.8457 0.0941929C6.34567 0.726537 3.19848 4.90263 3.83083 9.40263C4.18567 11.9287 5.52395 14.2383 7.59817 15.9061C8.75036 16.8286 10.0502 17.4764 11.2835 17.7661C11.3767 17.7885 11.4579 17.8458 11.5102 17.9262C11.5625 18.0065 11.582 18.1039 11.5647 18.1983L11.3365 19.4348C11.3033 19.6031 11.3277 19.7776 11.4058 19.9303C11.4692 20.052 11.5648 20.154 11.6822 20.2252C11.7995 20.2964 11.9342 20.334 12.0715 20.3339C12.1064 20.334 12.1414 20.3314 12.176 20.3264L13.0108 20.2092C13.0307 20.2064 13.051 20.2101 13.0686 20.2197C13.0863 20.2294 13.1003 20.2444 13.1088 20.2626C13.8925 21.9647 15.2397 23.2556 16.9596 23.9358C17.0537 23.9729 17.1544 23.9907 17.2556 23.9879C17.3568 23.9852 17.4564 23.962 17.5483 23.9197C17.6403 23.8775 17.7228 23.817 17.7908 23.742C17.8588 23.667 17.9109 23.5791 17.944 23.4834C18.0766 23.1 17.8671 22.6833 17.4902 22.5328C16.3135 22.0627 15.3328 21.2047 14.7105 20.1009C14.7026 20.0876 14.6982 20.0726 14.6975 20.0571C14.6969 20.0417 14.7001 20.0263 14.7068 20.0124C14.7135 19.9985 14.7236 19.9864 14.7361 19.9773C14.7486 19.9682 14.7632 19.9624 14.7785 19.9603L15.1254 19.9134C15.3069 19.89 15.4742 19.8032 15.5979 19.6683C15.6979 19.5564 15.762 19.417 15.782 19.2683C15.802 19.1195 15.7768 18.9682 15.7099 18.8339L15.1446 17.6981C15.1016 17.6118 15.0935 17.5123 15.122 17.4202C15.1504 17.3282 15.2133 17.2506 15.2974 17.2036C16.4032 16.5862 17.4747 15.6098 18.3279 14.4037ZM11.0669 15.1903C10.9726 15.1903 10.8791 15.1725 10.7913 15.1378C8.85723 14.3728 7.21473 12.6675 6.50458 10.6875C6.46997 10.5945 6.45416 10.4955 6.45808 10.3963C6.462 10.2972 6.48556 10.1998 6.52739 10.1098C6.56923 10.0198 6.62851 9.93898 6.7018 9.87206C6.77509 9.80515 6.86093 9.75344 6.95435 9.71994C7.04777 9.68645 7.14691 9.67182 7.24603 9.67692C7.34514 9.68202 7.44225 9.70674 7.53174 9.74964C7.62123 9.79255 7.70132 9.85279 7.76736 9.92688C7.83339 10.001 7.88407 10.0874 7.91645 10.1812C8.59614 12.0768 10.1322 13.2642 11.343 13.7437C11.5054 13.8079 11.6403 13.9267 11.7245 14.0797C11.8086 14.2327 11.8368 14.4102 11.8041 14.5817C11.7714 14.7533 11.6798 14.908 11.5453 15.0192C11.4107 15.1305 11.2415 15.1913 11.0669 15.1912V15.1903Z"
        fill="currentColor"
      />
    </svg>
  )
}

function GoatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15.7498 12C14.7861 12 13.8542 11.5697 13.1248 10.7888C12.4156 10.027 11.9825 9.01125 11.9061 7.92938C11.8245 6.77531 12.1766 5.71406 12.897 4.94063C13.6175 4.16719 14.6248 3.75 15.7498 3.75C16.8669 3.75 17.877 4.17469 18.5952 4.94625C19.3203 5.72531 19.6733 6.78469 19.5917 7.92891C19.5134 9.01219 19.0808 10.0275 18.373 10.7883C17.6455 11.5697 16.7141 12 15.7498 12Z"
        fill="currentColor"
      />
      <path
        d="M21.9302 20.25H9.57163C9.37294 20.2511 9.17664 20.2065 8.99786 20.1198C8.81908 20.0331 8.66257 19.9065 8.54038 19.7498C8.41078 19.58 8.32127 19.383 8.27857 19.1736C8.23588 18.9643 8.24109 18.748 8.29382 18.5409C8.68851 16.9561 9.66632 15.6417 11.1213 14.7403C12.4127 13.9406 14.0566 13.5 15.7507 13.5C17.478 13.5 19.0788 13.9219 20.3777 14.7211C21.836 15.6178 22.8152 16.9397 23.208 18.5437C23.2601 18.751 23.2648 18.9672 23.2216 19.1765C23.1784 19.3857 23.0885 19.5825 22.9587 19.7522C22.8366 19.9082 22.6805 20.0341 22.5022 20.1204C22.3239 20.2067 22.1283 20.251 21.9302 20.25Z"
        fill="currentColor"
      />
      <path
        d="M6.88995 12.1875C5.24041 12.1875 3.7901 10.6538 3.65557 8.76891C3.58901 7.80328 3.88995 6.91031 4.49932 6.25547C5.10213 5.60719 5.95245 5.25 6.88995 5.25C7.82745 5.25 8.6712 5.60906 9.27729 6.26109C9.89135 6.92109 10.1914 7.81219 10.121 8.76984C9.98651 10.6542 8.53666 12.1875 6.88995 12.1875Z"
        fill="currentColor"
      />
      <path
        d="M9.96838 13.6613C9.14385 13.2582 8.0737 13.0566 6.89104 13.0566C5.5101 13.0566 4.16901 13.4166 3.11432 14.0701C1.91854 14.8121 1.11417 15.8926 0.789322 17.1971C0.741783 17.3847 0.737287 17.5807 0.776169 17.7703C0.815051 17.9599 0.896305 18.1383 1.01385 18.2921C1.12539 18.4353 1.26828 18.551 1.43154 18.6303C1.5948 18.7096 1.77407 18.7504 1.95557 18.7496H7.1587C7.24652 18.7496 7.33155 18.7188 7.39896 18.6625C7.46638 18.6062 7.5119 18.528 7.5276 18.4416C7.53276 18.4121 7.53932 18.3826 7.54682 18.3535C7.94432 16.757 8.87573 15.4079 10.252 14.4245C10.3026 14.388 10.3433 14.3394 10.3704 14.2832C10.3975 14.227 10.4102 14.165 10.4073 14.1026C10.4044 14.0403 10.3859 13.9797 10.3536 13.9263C10.3214 13.8729 10.2763 13.8284 10.2224 13.7968C10.1489 13.7537 10.0645 13.7082 9.96838 13.6613Z"
        fill="currentColor"
      />
    </svg>
  )
}

const activities = [
  {
    title: '세미나',
    body: ['현업·선배 강연으로', '인사이트를 빠르게 얻어요.'],
    mobileTextWidth: 'mobile:max-w-[124px]',
    icon: SeminarIcon
  },
  {
    title: '스터디',
    body: ['함께 목표를 세우고', '꾸준히 학습해요.'],
    mobileTextWidth: 'mobile:max-w-[89px]',
    icon: StudyIcon
  },
  {
    title: '네트워킹',
    body: ['관심사가 비슷한 사람들과', '자연스럽게 연결돼요.'],
    mobileTextWidth: 'mobile:max-w-[120px]',
    icon: NetworkingIcon
  },
  {
    title: '대표 이벤트',
    body: ['Google 커뮤니티와 함께', '대규모 행사에 참여해요.'],
    mobileTextWidth: 'mobile:max-w-[118px]',
    icon: EventIcon
  },
  {
    title: 'GOAT',
    body: ['한 학기 팀 프로젝트로', '기획부터 개발까지 완주해요.'],
    mobileTextWidth: 'mobile:max-w-[134px]',
    icon: GoatIcon
  }
]

const goatPoints = [
  {
    title: '완주 중심',
    body: '아이디어에서 끝나지 않고 실제 결과물을 만들어요.'
  },
  {
    title: '성장 지원',
    body: '분야별 스터디와 멘토링으로 완주를 돕습니다.'
  },
  {
    title: '협업·포트폴리오',
    body: '개발·디자인·PM이 함께 협업 경험을 남겨요.'
  }
]

const faqs: Array<{ question: string; answer: string[]; accent: Accent }> = [
  {
    question: '가입하면 무엇을 할 수 있나요?',
    answer: [
      'GDGoC INHA만의 다채로운 행사를 즐기실 수 있습니다!',
      '2026년 1학기 기준,',
      '네트워킹 행사: 간식드리미, 친해지길 바라, 빙고',
      '학술 행사: GOAT 2.0, AX 프로그램, Build with AI : AINGTHON',
      'Google 연계 행사: Build with AI Incheon, Google I/O Extended 등의 행사를 진행했습니다'
    ],
    accent: 'red'
  },
  {
    question: '비개발자도 참여할 수 있나요?',
    answer: [
      '비개발자도 참여가능합니다! 현재 저희 동아리에는 경영학과, 경제학과, 중국학과, 소비자학과 등 여러 학과의 학생들도 많이 활동하고 있습니다.'
    ],
    accent: 'blue'
  },
  {
    question: '활동은 얼마나 자주 하나요?',
    answer: [
      '네트워킹 활동은 한 달에 두 번 정도 진행되고 있으며, 학술 활동은 한 달에 한 번 정도 진행되고 있습니다.'
    ],
    accent: 'green'
  },
  {
    question: 'GOAT는 누구나 지원할 수 있나요?',
    answer: [
      'GOAT는 GDGoC INHA 부원이라면 누구나 지원할 수 있습니다. 프로젝트 경험이 많지 않아도 팀과 함께 완주할 수 있도록 스터디와 멘토링을 함께 제공합니다.'
    ],
    accent: 'yellow'
  },
  {
    question: '참가비/비용이 있나요?',
    answer: [
      '동아리 회비는 20,000원입니다. 이는 동아리 행사 진행, 굿즈 제공 등에 사용되며, 대부분의 부원들이 회비 이상의 혜택을 누리고 있습니다.'
    ],
    accent: 'red'
  },
  {
    question: '문의는 어디로 하면 되나요?',
    answer: [
      '문의는 공식메일(gdsc.inha@gmail.com) 또는 카카오톡(링크: https://open.kakao.com/o/s3fxV67h)으로 해주시면 답변드리겠습니다.'
    ],
    accent: 'blue'
  }
]

const pageSectionClass = 'h-svh min-h-[640px] shrink-0'
const kakaoOpenChatUrl = 'https://open.kakao.com/o/s3fxV67h'

const pageIds = [
  'intro',
  'hero',
  'about',
  'stats',
  'values',
  'activities',
  // 'goat', // Later: re-enable this with <GoatSection /> in pages.
  'join',
  'faq'
] as const

const CTA_PAGE_INDEX = pageIds.indexOf('join')

type IntroLogoOverlayAnimation = {
  x: number
  y: number
  scale: number
}

function SectionShell({
  id,
  children,
  className,
  onClick
}: {
  id: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <section
      id={id}
      onClick={onClick}
      className={cn(
        pageSectionClass,
        'relative flex w-full items-center justify-center overflow-hidden bg-transparent px-10 py-24 mobile:px-4 mobile:py-[55px]',
        className
      )}
    >
      <div className="relative z-10 w-full max-w-[1120px]">{children}</div>
    </section>
  )
}

function SiteHeader({
  activeId,
  onNavigate,
  logoRef
}: {
  activeId: string
  onNavigate: (sectionId: string) => void
  logoRef?: RefObject<HTMLDivElement>
}) {
  const { user } = useAuth()
  const isLoggedIn = Boolean(user)
  const activeNavIndex = getActiveNavIndex(activeId)
  const loginIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 26.8671C8 22.9342 11.2857 19.746 18 19.746C24.7143 19.746 28 22.9342 28 26.8671C28 27.4928 27.5435 28 26.9804 28H9.01961C8.45649 28 8 27.4928 8 26.8671Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M21.75 11.75C21.75 13.8211 20.0711 15.5 18 15.5C15.9289 15.5 14.25 13.8211 14.25 11.75C14.25 9.67893 15.9289 8 18 8C20.0711 8 21.75 9.67893 21.75 11.75Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
  return (
    <header className="fixed left-0 top-0 z-50 h-[72px] w-full bg-black mobile:h-11">
      <div className="mx-auto grid h-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-10 mobile:flex mobile:max-w-[375px] mobile:px-4">
        <div ref={logoRef} className="justify-self-start mobile:hidden">
          <GdgLogo mode="pc" variant="long" priority />
        </div>
        <nav className="relative flex h-full items-center justify-center typo-pc-b2 mobile:flex-1 mobile:typo-m-s3">
          {navItems.map((item, index) => (
            <a
              key={item.label}
              href={`#${item.id}`}
              aria-current={index === activeNavIndex ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault()
                onNavigate(item.id)
              }}
              className={cn(
                'flex h-6 w-30 items-center justify-center transition-colors hover:text-white mobile:h-full mobile:flex-1 mobile:w-auto',
                index === activeNavIndex ? 'text-white' : 'text-gray-500'
              )}
            >
              {item.label}
            </a>
          ))}
          <span
            className="absolute bottom-0 left-[calc(var(--active-nav-index)*120px)] h-0.5 w-30 bg-red transition-[left] duration-300 ease-out mobile:left-[calc(var(--active-nav-index)*100%/3)] mobile:w-[calc(100%/3)]"
            style={
              {
                '--active-nav-index': activeNavIndex
              } as CSSProperties
            }
            aria-hidden
          />
        </nav>
        {/* mobile:hidden 을 두면 모바일에 진입 수단이 아예 없다. 같은 파일의
            MobileMenuDrawer 는 정의만 있고 렌더되지 않는 죽은 코드라, 드로어의
            마이페이지 항목은 화면에 나오지 않는다. 게시판 링크도 같은 이유로
            여기 둔다 — 드로어의 게시판 항목만으로는 모바일에서 도달할 수 없다. */}
        <div className="flex items-center gap-4 justify-self-end">
          <a
            href="/board/events/"
            className="typo-pc-b2 text-gray-500 transition-colors hover:text-white"
          >
            게시판
          </a>
          {/* 로그인 상태에서도 /login?next=%2F 로 보내면 로그인 후 / 가 /onboarding 으로
              리다이렉트돼 제자리로 돌아온다. 로그인했으면 내 정보로 보낸다. */}
          <a
            href={isLoggedIn ? '/profile' : '/login?next=%2F'}
            className="flex size-11 items-center justify-center text-gray-500 transition-colors hover:text-white"
            aria-label={isLoggedIn ? '내 정보' : '로그인'}
          >
            {loginIcon}
          </a>
        </div>
      </div>
    </header>
  )
}

function MobileMenuDrawer({
  isOpen,
  user,
  showMenuItems = true,
  onClose,
  onNavigate,
  onLogout
}: {
  isOpen: boolean
  user: ReturnType<typeof useAuth>['user']
  showMenuItems?: boolean
  onClose: () => void
  onNavigate: (sectionId: string) => void
  onLogout: () => void
}) {
  const displayName = user?.name || '로그인 필요'
  const department = user?.team || 'GDGoC INHA'
  const studentId = user?.email || '계정으로 로그인해 주세요'
  const role = user?.userRole || 'GUEST'
  const isLoggedIn = Boolean(user)
  const canSeeDashboard = (ROLE_RANK[role] ?? 0) >= ROLE_RANK.CORE

  const menuItems = [
    { label: '소개', action: () => onNavigate('about') },
    { label: '활동', action: () => onNavigate('activities') },
    { label: 'FAQ', action: () => onNavigate('faq') },
    { label: '게시판', href: '/board/events/' },
    { label: '마이페이지', href: '/profile' },
    ...(canSeeDashboard ? [{ label: '대시보드', href: '/dashboard' }] : [])
  ]

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] hidden transition-[visibility] mobile:block',
        isOpen ? 'visible' : 'invisible'
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-label="메뉴 닫기"
        tabIndex={isOpen ? 0 : -1}
      />
      <aside
        className={cn(
          'absolute right-0 top-0 h-svh w-[242px] bg-[#1e1e1e] text-white shadow-[0_0_8px_0_rgba(250,250,250,0.25)] transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
      >
        <button
          type="button"
          className="absolute left-[7px] top-4 flex size-6 items-center justify-center text-white"
          onClick={onClose}
          aria-label="메뉴 닫기"
          tabIndex={isOpen ? 0 : -1}
        >
          <ChevronRight className="size-6" strokeWidth={2} aria-hidden />
        </button>
        {isLoggedIn ? (
          <div className="absolute left-4 top-[204px] flex items-center gap-4">
            <div className="size-16 overflow-hidden rounded-full bg-[#cccccc]">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={64}
                  height={64}
                  className="size-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex w-[104px] flex-col items-start gap-2">
              <div className="flex w-full items-center gap-2">
                <p className="truncate typo-m-s2">{displayName}</p>
                <span className="rounded-[800px] bg-green-400 px-3 py-1 text-green typo-pc-c2">
                  {role}
                </span>
              </div>
              <div className="flex w-full flex-col items-start text-white typo-m-c1">
                <p className="w-full truncate">{department}</p>
                <p className="w-full truncate">{studentId}</p>
              </div>
            </div>
          </div>
        ) : showMenuItems ? (
          <a
            href="/login?next=%2F"
            className="absolute left-6 top-[144px] flex h-11 w-[104px] items-center justify-center rounded-full border border-white text-white typo-m-b2 transition-colors hover:bg-white hover:text-black"
            tabIndex={isOpen ? 0 : -1}
            onClick={onClose}
          >
            로그인
          </a>
        ) : null}
        {showMenuItems ? (
          <nav className="absolute left-6 top-[318px] flex flex-col items-start gap-6 text-white typo-m-b2">
            {menuItems.map((item) =>
              'href' in item ? (
                <a key={item.label} href={item.href} tabIndex={isOpen ? 0 : -1} onClick={onClose}>
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className="text-left"
                  onClick={item.action}
                  tabIndex={isOpen ? 0 : -1}
                >
                  {item.label}
                </button>
              )
            )}
          </nav>
        ) : null}
        {isLoggedIn ? (
          <button
            type="button"
            className="absolute left-6 top-[550px] flex items-center gap-2 text-white typo-m-b2"
            onClick={() => {
              onClose()
              onLogout()
            }}
            tabIndex={isOpen ? 0 : -1}
          >
            <LogOut className="size-6" strokeWidth={2} aria-hidden />
            로그아웃
          </button>
        ) : null}
      </aside>
    </div>
  )
}

function RecruitButton({ className }: { className?: string }) {
  const router = useRouter()

  return (
    <GdgButton
      variant="active"
      fullWidth
      className={cn(
        'h-[52px] max-w-[550px] border-red bg-red typo-pc-s3 mobile:h-12 mobile:max-w-[166px] mobile:px-8 mobile:typo-m-s3',
        className
      )}
      onClick={() => router.push('/recruit')}
    >
      지원하기
    </GdgButton>
  )
}

function HeroSection({ onMore }: { onMore: () => void }) {
  return (
    <section
      className={cn(
        pageSectionClass,
        'relative flex w-full items-center justify-center overflow-hidden bg-transparent px-10 pt-[72px] mobile:px-4 mobile:pt-11'
      )}
    >
      <div className="relative z-10 flex w-full max-w-[734px] flex-col items-center gap-20 text-center text-white mobile:max-w-[343px] mobile:gap-20">
        <div className="flex w-full flex-col items-center gap-8 mobile:gap-6">
          <div className="flex flex-col items-center gap-2 typo-pc-h2 mobile:gap-1 mobile:typo-m-h2">
            <h1 className="break-keep">
              <span className="pc:inline mobile:block">Google 개발자 커뮤니티에서</span>
              <span className="pc:inline mobile:block pc:ml-2">함께 성장하는 즐거움,</span>
            </h1>
            <p>GDGoC INHA에서</p>
          </div>
          <p className="typo-pc-s1 mobile:typo-m-s2">모두가 함께하는 성장을 꿈꿉니다.</p>
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          <RecruitButton />
          <p className="typo-pc-c1 mobile:typo-m-c1">GDGoC INHA와 함께해요.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onMore}
        className="absolute bottom-9 left-1/2 z-10 flex w-[226px] -translate-x-1/2 flex-col items-center text-white mobile:bottom-8 mobile:w-[116px]"
        aria-label="더 알아보기"
      >
        <span className="flex w-full flex-col items-center">
          <span className="typo-pc-c1 mobile:typo-m-c1">더 알아보기</span>
          <span
            className="relative mt-1 h-9 w-full animate-[onboarding-arrow-float_1.8s_ease-in-out_infinite]"
            aria-hidden
          >
            <span className="absolute left-1/2 top-3 flex h-[41px] w-[118px] -translate-x-[calc(50%+54px)] items-center justify-center mobile:w-[57px] mobile:-translate-x-[calc(50%+26px)]">
              <span className="h-2 w-[120px] flex-none rotate-16 rounded-[400px] bg-white mobile:h-1 mobile:w-[58px]" />
            </span>
            <span className="absolute left-1/2 top-3 flex h-[41px] w-[118px] -translate-x-[calc(50%-54px)] items-center justify-center mobile:w-[57px] mobile:-translate-x-[calc(50%-26px)]">
              <span className="h-2 w-[120px] flex-none -rotate-16 rounded-[400px] bg-white mobile:h-1 mobile:w-[58px]" />
            </span>
          </span>
        </span>
      </button>
    </section>
  )
}

function AboutSection() {
  return (
    <SectionShell id="about">
      <div className="mx-auto flex max-w-[550px] flex-col items-center gap-12 text-center text-white mobile:max-w-[343px]">
        <div className="flex flex-col gap-2 typo-pc-h3 mobile:gap-1 mobile:typo-m-h2">
          <h2>GDGoC INHA는</h2>
          <p className="mobile:hidden">인하대학교의 Google 개발자 커뮤니티예요.</p>
          <p className="hidden mobile:block">인하대학교의</p>
          <p className="hidden mobile:block">Google 개발자 커뮤니티예요.</p>
        </div>
        <div className="flex w-full flex-col items-center gap-2">
          <p className="typo-pc-s1 mobile:typo-m-s2">GDGoC란?</p>
          <div className="w-full rounded-xl bg-gray-100 px-4 py-3 text-left mobile:px-3.5 mobile:py-3">
            <ul className="list-disc pl-5 typo-pc-b3 mobile:hidden">
              <li>
                Google Developer Groups on Campus는 Google이 대학생 개발자 성장을 위해 지원하는 대학
                거점형 커뮤니티입니다.
              </li>
            </ul>
            <div className="hidden w-full items-start gap-1 mobile:flex mobile:typo-m-c1">
              <span className="shrink-0">•</span>
              <p>
                Google Developer Groups on Campus는 Google이 대학생 개발자 성장을 위해 지원하는 대학
                거점형 커뮤니티입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

function StatsSection() {
  return (
    <SectionShell id="stats">
      <div className="flex flex-col items-center gap-12 text-white mobile:gap-8">
        <h2 className="break-keep typo-pc-h3 mobile:typo-m-h3">숫자로 보는 GDGoC INHA</h2>
        <div className="grid w-full grid-cols-4 gap-5 mobile:max-w-[343px] mobile:grid-cols-2 mobile:gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex h-60 flex-col items-center justify-center gap-2 rounded-2xl bg-gray-100 p-6 text-center mobile:h-[152px] mobile:p-4"
            >
              <p className="whitespace-nowrap typo-pc-s1 mobile:typo-m-s3">{stat.label}</p>
              <p className="typo-pc-h1 mobile:typo-m-h2">
                <CountUpValue value={stat.value} suffix="+" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}

function CountUpValue({
  value,
  suffix = '',
  duration = 900
}: {
  value: number
  suffix?: string
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let animationFrame = 0
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      setDisplayValue(Math.round(value * easedProgress))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [duration, value])

  return (
    <>
      {displayValue}
      {suffix}
    </>
  )
}

function ValuesSection() {
  const [hoveredValue, setHoveredValue] = useState<string | null>(null)
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const activeValue = isMobileViewport ? selectedValue : hoveredValue

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 47.9375rem)')
    const updateViewport = () => setIsMobileViewport(mobileQuery.matches)

    updateViewport()
    mobileQuery.addEventListener('change', updateViewport)

    return () => mobileQuery.removeEventListener('change', updateViewport)
  }, [])

  return (
    <SectionShell
      id="values"
      onClick={() => {
        if (isMobileViewport) setSelectedValue(null)
      }}
    >
      <div className="flex flex-col items-center gap-12 text-white mobile:gap-8">
        <h2 className="break-keep typo-pc-h3 mobile:typo-m-h2">GDGoC INHA의 4가지 핵심 가치</h2>
        <div className="grid grid-cols-2 gap-5 mobile:grid-cols-2 mobile:gap-2">
          {values.map((value) => {
            const isActive = activeValue === value.title
            const isDimmed = activeValue !== null && !isActive

            return (
              <button
                type="button"
                key={value.title}
                aria-pressed={isActive}
                onMouseEnter={() => {
                  if (!isMobileViewport) setHoveredValue(value.title)
                }}
                onMouseLeave={() => {
                  if (!isMobileViewport) setHoveredValue(null)
                }}
                onClick={(event) => {
                  event.stopPropagation()
                  if (isMobileViewport) {
                    setSelectedValue((current) => (current === value.title ? null : value.title))
                  }
                }}
                className={cn(
                  'flex h-40 w-[309px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl px-8 py-6 text-center transition-[background-color,color,transform] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white mobile:h-[148px] mobile:w-[168px] mobile:px-4',
                  isActive && 'scale-[1.052]',
                  isDimmed ? 'bg-[#282828] text-gray-700' : 'bg-gray-100 text-white'
                )}
              >
                <span
                  className={cn(
                    'rounded-full px-6 py-1.5 typo-pc-s1 mobile:typo-m-s1 transition-colors duration-200',
                    isDimmed
                      ? valueTagStateClass[value.accent].inactive
                      : valueTagStateClass[value.accent].active,
                    isDimmed ? 'text-gray-700' : 'text-white'
                  )}
                >
                  {value.title}
                </span>
                <p className="whitespace-pre-line break-keep typo-pc-b2 mobile:max-w-[132px] mobile:typo-m-b3">
                  {value.body}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </SectionShell>
  )
}

function ActivitiesSection() {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const activeActivity = isMobileViewport ? selectedActivity : hoveredActivity
  const showMobileActivityDetail = isMobileViewport && selectedActivity !== null

  const toggleActivity = (title: string) => {
    if (!isMobileViewport) return
    setSelectedActivity((current) => (current === title ? null : title))
  }

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 47.9375rem)')
    const updateViewport = () => setIsMobileViewport(mobileQuery.matches)

    updateViewport()
    mobileQuery.addEventListener('change', updateViewport)

    return () => mobileQuery.removeEventListener('change', updateViewport)
  }, [])

  return (
    <SectionShell
      id="activities"
      onClick={() => {
        if (isMobileViewport) setSelectedActivity(null)
      }}
    >
      <div className="flex flex-col items-center gap-12 text-white mobile:gap-8">
        <h2 className="break-keep typo-pc-h3 mobile:typo-m-h3">GDGoC INHA에서 할 수 있는 활동</h2>
        <div className="flex w-full max-w-[856px] flex-col gap-5 mobile:max-w-[342px] mobile:gap-2">
          <div className="flex w-full flex-col gap-5 mobile:hidden">
            <div className="flex w-full items-center justify-center gap-5">
              {activities.slice(0, 3).map(({ title, body, mobileTextWidth, icon: Icon }) => (
                <ActivityCard
                  key={title}
                  title={title}
                  body={body}
                  mobileTextWidth={mobileTextWidth}
                  icon={Icon}
                  isActive={activeActivity === title}
                  isMobileDetailVisible={showMobileActivityDetail}
                  isMobileViewport={isMobileViewport}
                  onSelect={() => toggleActivity(title)}
                  onHoverChange={(isHovered) => setHoveredActivity(isHovered ? title : null)}
                />
              ))}
            </div>
            <div className="flex w-full items-center justify-center gap-5">
              {activities.slice(3).map(({ title, body, mobileTextWidth, icon: Icon }) => (
                <ActivityCard
                  key={title}
                  title={title}
                  body={body}
                  mobileTextWidth={mobileTextWidth}
                  icon={Icon}
                  wide
                  isActive={activeActivity === title}
                  isMobileDetailVisible={showMobileActivityDetail}
                  isMobileViewport={isMobileViewport}
                  onSelect={() => toggleActivity(title)}
                  onHoverChange={(isHovered) => setHoveredActivity(isHovered ? title : null)}
                />
              ))}
            </div>
          </div>
          <div className="hidden w-full items-center justify-start gap-5 mobile:flex mobile:flex-wrap mobile:gap-2">
            {activities.slice(0, 2).map(({ title, body, mobileTextWidth, icon: Icon }) => (
              <ActivityCard
                key={title}
                title={title}
                body={body}
                mobileTextWidth={mobileTextWidth}
                icon={Icon}
                isActive={activeActivity === title}
                isMobileDetailVisible={showMobileActivityDetail}
                isMobileViewport={isMobileViewport}
                onSelect={() => toggleActivity(title)}
                onHoverChange={(isHovered) => setHoveredActivity(isHovered ? title : null)}
              />
            ))}
          </div>
          <div className="hidden w-full items-center justify-start gap-5 mobile:flex mobile:flex-wrap mobile:gap-2">
            {activities.slice(2, 4).map(({ title, body, mobileTextWidth, icon: Icon }) => (
              <ActivityCard
                key={title}
                title={title}
                body={body}
                mobileTextWidth={mobileTextWidth}
                icon={Icon}
                isActive={activeActivity === title}
                isMobileDetailVisible={showMobileActivityDetail}
                isMobileViewport={isMobileViewport}
                onSelect={() => toggleActivity(title)}
                onHoverChange={(isHovered) => setHoveredActivity(isHovered ? title : null)}
              />
            ))}
          </div>
          <div className="hidden w-full items-center justify-start gap-5 mobile:flex mobile:flex-wrap mobile:gap-2">
            {activities.slice(4).map(({ title, body, mobileTextWidth, icon: Icon }) => (
              <ActivityCard
                key={title}
                title={title}
                body={body}
                mobileTextWidth={mobileTextWidth}
                icon={Icon}
                wide
                isActive={activeActivity === title}
                isMobileDetailVisible={showMobileActivityDetail}
                isMobileViewport={isMobileViewport}
                onSelect={() => toggleActivity(title)}
                onHoverChange={(isHovered) => setHoveredActivity(isHovered ? title : null)}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

function ActivityCard({
  title,
  body,
  mobileTextWidth,
  icon: Icon,
  wide = false,
  isActive,
  isMobileDetailVisible,
  isMobileViewport,
  onSelect,
  onHoverChange
}: {
  title: string
  body: string[]
  mobileTextWidth: string
  icon: ({ className }: { className?: string }) => ReactNode
  wide?: boolean
  isActive: boolean
  isMobileDetailVisible: boolean
  isMobileViewport: boolean
  onSelect: () => void
  onHoverChange: (isHovered: boolean) => void
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      onMouseEnter={() => {
        if (!isMobileViewport) onHoverChange(true)
      }}
      onMouseLeave={() => {
        if (!isMobileViewport) onHoverChange(false)
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl bg-gray-100 px-6 py-8 text-center text-white transition-[height,width] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white mobile:h-32 mobile:min-h-0 mobile:w-[167px] mobile:gap-2 mobile:px-6 mobile:py-8',
        wide
          ? isActive
            ? 'h-[188px] w-[428px]'
            : 'h-[178px] w-[407px]'
          : isActive
            ? 'h-[192px] w-[285px]'
            : 'h-[178px] w-[265px]',
        isMobileDetailVisible && isActive && !wide && 'mobile:h-[134px] mobile:w-[167px]',
        wide &&
          (isMobileDetailVisible && isActive ? 'mobile:h-[130px] mobile:w-full' : 'mobile:w-full')
      )}
    >
      <Icon
        className={cn(
          'shrink-0 text-white transition-[width,height] duration-200',
          isActive ? 'size-6' : 'size-10',
          isMobileDetailVisible && isActive ? 'mobile:size-4' : 'mobile:size-6'
        )}
      />
      <div className="flex w-full flex-col items-center gap-2">
        <p
          className={cn(
            isActive ? 'typo-pc-s2' : 'typo-pc-h4',
            isMobileDetailVisible && isActive ? 'mobile:typo-m-s3' : 'mobile:typo-m-s2'
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            'max-w-[380px] break-keep text-center typo-pc-b3 mobile:typo-m-c1',
            isActive ? 'pc:block' : 'hidden',
            isMobileDetailVisible && isActive && 'mobile:block',
            isMobileDetailVisible && isActive && mobileTextWidth
          )}
        >
          {body.map((line) => (
            <span key={line} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
        </p>
      </div>
    </button>
  )
}

function GoatSection() {
  return (
    <SectionShell id="goat">
      <div className="mx-auto flex max-w-[834px] flex-col items-center gap-12 text-white">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-4">
            <h2 className="typo-pc-h3 mobile:typo-m-h2">GOAT</h2>
            <CircleHelp className="size-5" aria-hidden />
          </div>
          <p className="typo-pc-s1 mobile:typo-m-s1">GDGoC INHA의 시그니처 장기 프로젝트 트랙</p>
        </div>
        <div className="grid w-full grid-cols-[407px_1fr] gap-5 mobile:grid-cols-1">
          <div className="flex h-[390px] flex-col items-center justify-center rounded-2xl bg-gray-100 p-6 text-center mobile:h-60">
            <Sparkles className="mb-4 size-10" aria-hidden />
            <p className="typo-pc-h4 mobile:typo-m-h3">이미지 캐러셀</p>
          </div>
          <div className="flex flex-col gap-4">
            {goatPoints.map((point) => (
              <div key={point.title} className="rounded-2xl bg-gray-100 px-8 py-6">
                <p className="typo-pc-h4 mobile:typo-m-h3">{point.title}</p>
                <p className="mt-2 typo-pc-b2 mobile:typo-m-b3">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full rounded-2xl bg-gray-100 px-8 py-6">
          <p className="typo-pc-h4 mobile:typo-m-h3">모집 기간</p>
          <p className="mt-2 typo-pc-b2 mobile:typo-m-b3">3월 2일 ~ 3월 13일</p>
        </div>
      </div>
    </SectionShell>
  )
}

function BottomCtaSection() {
  return (
    <SectionShell id="join">
      <GdgLogo
        mode="pc"
        variant="icon"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 scale-[18] opacity-40 mobile:scale-[6.5]"
      />
      <div className="mx-auto flex max-w-[734px] flex-col items-center gap-20 text-center text-white mobile:gap-12">
        <div className="flex flex-col items-center gap-2 typo-pc-h3 mobile:gap-1 mobile:typo-m-h3">
          <p>지금</p>
          <p>
            <span className="typo-pc-h2 mobile:typo-m-h2">GDGoC INHA</span>에
          </p>
          <p className="typo-pc-h2 mobile:typo-m-h2">합류해보세요.</p>
        </div>
        <RecruitButton />
      </div>
    </SectionShell>
  )
}

function FaqSection() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(faqs[0]?.question ?? null)

  return (
    <SectionShell id="faq">
      <div className="flex flex-col items-center gap-12 text-white mobile:gap-8">
        <h2 className="typo-pc-h3 mobile:typo-m-h3">FAQ</h2>
        <div className="flex w-full flex-col gap-4 mobile:max-w-[343px]">
          {faqs.map((faq) => {
            const isOpen = openQuestion === faq.question

            return (
              <div key={faq.question} className="relative overflow-hidden rounded-2xl">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenQuestion((current) => (current === faq.question ? null : faq.question))
                  }
                  className="relative z-10 flex min-h-[58px] w-full items-center justify-between gap-4 rounded-2xl bg-[#333333] px-5 py-3 text-left mobile:min-h-12 mobile:gap-3 mobile:px-4 mobile:py-2"
                >
                  <span className="flex min-w-0 items-center gap-4 mobile:gap-2">
                    <span
                      className={cn(
                        'typo-pc-h4 mobile:typo-m-h4',
                        accentClass[faq.accent].split(' ')[1]
                      )}
                    >
                      Q
                    </span>
                    <span className="break-keep typo-pc-s2 mobile:typo-m-s3 text-white">
                      {faq.question}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-3 text-white transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                    aria-hidden
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-200 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  )}
                >
                  <div className={cn('min-h-0', isOpen ? 'overflow-visible' : 'overflow-hidden')}>
                    <div className="-mt-6 rounded-b-2xl bg-[#282828] px-6 pb-4 pt-10 text-white typo-pc-b2 mobile:px-4 mobile:typo-m-b3">
                      {faq.answer.map((line) => {
                        if (!line.includes(kakaoOpenChatUrl)) {
                          return <p key={line}>{line}</p>
                        }

                        const [before, after] = line.split(kakaoOpenChatUrl)

                        return (
                          <p key={line}>
                            {before}
                            <a
                              href={kakaoOpenChatUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue underline underline-offset-2 transition-colors hover:text-white"
                            >
                              {kakaoOpenChatUrl}
                            </a>
                            {after}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SectionShell>
  )
}

const introLogoScale = 85 / 53

function InitialLogoScreen({
  logoRef,
  isLogoHidden
}: {
  logoRef: RefObject<HTMLDivElement>
  isLogoHidden: boolean
}) {
  return (
    <section
      className={cn(
        pageSectionClass,
        'relative flex w-full items-center justify-center bg-black px-4'
      )}
    >
      <div
        ref={logoRef}
        className={cn('origin-center scale-[1.604] mobile:scale-100', isLogoHidden && 'opacity-0')}
      >
        <GdgLogo mode="auto" variant="long" priority />
      </div>
    </section>
  )
}

export default function OnboardingLanding() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isIntroLogoHidden, setIsIntroLogoHidden] = useState(false)
  const [introLogoOverlayStyle, setIntroLogoOverlayStyle] = useState<CSSProperties | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const introLogoRef = useRef<HTMLDivElement | null>(null)
  const introLogoOverlayRef = useRef<HTMLDivElement | null>(null)
  const headerLogoMeasureRef = useRef<HTMLDivElement | null>(null)
  const pendingIntroLogoAnimationRef = useRef<IntroLogoOverlayAnimation | null>(null)
  const incomingDirectionRef = useRef(1)
  const reduceMotionRef = useRef(false)
  const transitionLockRef = useRef(false)
  const introTransitionStartedRef = useRef(false)
  const touchStartYRef = useRef<number | null>(null)

  const runIntroLogoTransition = useCallback(() => {
    if (introTransitionStartedRef.current || transitionLockRef.current) return

    introTransitionStartedRef.current = true
    transitionLockRef.current = true
    incomingDirectionRef.current = 1

    const isMobileViewport = window.matchMedia('(max-width: 47.9375rem)').matches

    if (isMobileViewport) {
      if (reduceMotionRef.current || !stageRef.current) {
        setActiveIndex(1)
        window.setTimeout(() => {
          transitionLockRef.current = false
        }, 120)
        return
      }

      gsap.to(stageRef.current, {
        y: '-8%',
        opacity: 0,
        duration: 0.28,
        ease: 'power2.in',
        overwrite: true,
        onComplete: () => setActiveIndex(1)
      })
      return
    }

    if (reduceMotionRef.current || !introLogoRef.current) {
      setActiveIndex(1)
      window.setTimeout(() => {
        transitionLockRef.current = false
      }, 120)
      return
    }

    const startRect = introLogoRef.current.getBoundingClientRect()
    const targetRect = headerLogoMeasureRef.current?.getBoundingClientRect()
    const fallbackTargetLeft =
      window.innerWidth < 768
        ? 16
        : window.innerWidth > 1280
          ? (window.innerWidth - 1280) / 2 + 40
          : 40
    const targetLeft = targetRect?.left ?? fallbackTargetLeft
    const targetTop = targetRect?.top ?? 21
    const baseLogoWidth = startRect.width / introLogoScale
    const targetScale = targetRect && baseLogoWidth > 0 ? targetRect.width / baseLogoWidth : 1

    pendingIntroLogoAnimationRef.current = {
      x: targetLeft - startRect.left,
      y: targetTop - startRect.top,
      scale: targetScale
    }

    setIsIntroLogoHidden(true)
    setIntroLogoOverlayStyle({
      left: startRect.left,
      top: startRect.top,
      transform: `translate3d(0, 0, 0) scale(${introLogoScale})`,
      transformOrigin: 'top left'
    })
  }, [])

  const navigateToIndex = useCallback(
    (nextIndex: number) => {
      const boundedIndex = Math.min(Math.max(nextIndex, 0), pageIds.length - 1)
      if (boundedIndex === activeIndex || transitionLockRef.current) return

      if (activeIndex === 0 && boundedIndex === 1) {
        runIntroLogoTransition()
        return
      }

      const nextDirection = boundedIndex > activeIndex ? 1 : -1
      incomingDirectionRef.current = nextDirection
      transitionLockRef.current = true

      if (reduceMotionRef.current || !stageRef.current) {
        setActiveIndex(boundedIndex)
        window.setTimeout(() => {
          transitionLockRef.current = false
        }, 120)
        return
      }

      gsap.to(stageRef.current, {
        y: nextDirection > 0 ? '-8%' : '8%',
        opacity: 0,
        duration: 0.28,
        ease: 'power2.in',
        overwrite: true,
        onComplete: () => setActiveIndex(boundedIndex)
      })
    },
    [activeIndex, runIntroLogoTransition]
  )

  const navigateToId = useCallback(
    (sectionId: string) => {
      const targetIndex = pageIds.findIndex((pageId) => pageId === sectionId)
      if (targetIndex >= 0) navigateToIndex(targetIndex)
    },
    [navigateToIndex]
  )

  const pages = useMemo(
    () => [
      {
        id: 'intro',
        node: <InitialLogoScreen logoRef={introLogoRef} isLogoHidden={isIntroLogoHidden} />
      },
      { id: 'hero', node: <HeroSection onMore={() => navigateToId('about')} /> },
      { id: 'about', node: <AboutSection /> },
      { id: 'stats', node: <StatsSection /> },
      { id: 'values', node: <ValuesSection /> },
      { id: 'activities', node: <ActivitiesSection /> },
      // { id: 'goat', node: <GoatSection /> }, // Later: re-enable GOAT section here.
      { id: 'join', node: <BottomCtaSection /> },
      { id: 'faq', node: <FaqSection /> }
    ],
    [isIntroLogoHidden, navigateToId]
  )

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (Math.abs(event.deltaY) < 24) return
      navigateToIndex(activeIndex + (event.deltaY > 0 ? 1 : -1))
    },
    [activeIndex, navigateToIndex]
  )

  const handleTouchStart = useCallback((event: TouchEvent<HTMLElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null
  }, [])

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      if (touchStartYRef.current === null) return
      const endY = event.changedTouches[0]?.clientY ?? touchStartYRef.current
      const deltaY = touchStartYRef.current - endY
      touchStartYRef.current = null
      if (Math.abs(deltaY) < 48) return
      navigateToIndex(activeIndex + (deltaY > 0 ? 1 : -1))
    },
    [activeIndex, navigateToIndex]
  )

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault()
        navigateToIndex(activeIndex + 1)
      }

      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
        navigateToIndex(activeIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, navigateToIndex])

  useEffect(() => {
    if (activeIndex === 0 && !introLogoOverlayStyle) {
      introTransitionStartedRef.current = false
      setIsIntroLogoHidden(false)
    }
  }, [activeIndex, introLogoOverlayStyle])

  useEffect(() => {
    if (activeIndex !== 0) return

    const introTimer = window.setTimeout(() => {
      runIntroLogoTransition()
    }, 1000)

    return () => window.clearTimeout(introTimer)
  }, [activeIndex, runIntroLogoTransition])

  useLayoutEffect(() => {
    if (!introLogoOverlayStyle) return

    const overlayElement = introLogoOverlayRef.current
    const animation = pendingIntroLogoAnimationRef.current

    if (!overlayElement || !animation) {
      setActiveIndex(1)
      setIntroLogoOverlayStyle(null)
      transitionLockRef.current = false
      return
    }

    const tween = gsap.to(overlayElement, {
      x: animation.x,
      y: animation.y,
      scale: animation.scale,
      duration: 1,
      ease: 'power3.inOut',
      overwrite: true,
      onComplete: () => {
        pendingIntroLogoAnimationRef.current = null
        setActiveIndex(1)
        setIntroLogoOverlayStyle(null)
        transitionLockRef.current = false
      }
    })

    return () => {
      tween.kill()
    }
  }, [introLogoOverlayStyle])

  useEffect(() => {
    if (!stageRef.current) return

    if (!transitionLockRef.current || reduceMotionRef.current) {
      gsap.set(stageRef.current, { y: 0, opacity: 1 })
      return
    }

    const direction = incomingDirectionRef.current

    gsap.fromTo(
      stageRef.current,
      { y: direction > 0 ? '8%' : '-8%', opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.56,
        ease: 'power3.out',
        overwrite: true,
        onComplete: () => {
          transitionLockRef.current = false
        }
      }
    )
  }, [activeIndex])

  const currentPage = pages[activeIndex]
  const showOnboardingBackground = activeIndex < CTA_PAGE_INDEX

  return (
    <main
      className="relative isolate h-svh w-full overflow-hidden bg-black"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-300',
          showOnboardingBackground ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden
      >
        <Image
          src={onboardingBg}
          alt=""
          priority
          className="absolute left-1/2 top-1/2 h-auto w-[1400px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-70 mobile:hidden"
          sizes="(max-width: 767px) 225vw, 1620px"
        />
        <Image
          src={onboardingBgMobile}
          alt=""
          priority
          className="absolute left-1/2 top-1/2 hidden h-auto w-[315px] max-w-none -translate-x-1/2 -translate-y-1/2 mobile:block"
          sizes="315px"
        />
        <div className="absolute inset-0" />
      </div>
      {activeIndex !== 0 ? (
        <SiteHeader activeId={currentPage.id} onNavigate={navigateToId} />
      ) : null}
      <div
        className="pointer-events-none fixed left-0 top-0 z-[-1] h-[72px] w-full opacity-0"
        aria-hidden
      >
        <div className="mx-auto grid h-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-10 mobile:grid-cols-[1fr_auto] mobile:px-4">
          <div ref={headerLogoMeasureRef} className="justify-self-start">
            <GdgLogo mode="pc" variant="long" priority />
          </div>
        </div>
      </div>
      <div ref={stageRef} className="absolute inset-0 z-10">
        {currentPage.node}
      </div>
      {introLogoOverlayStyle ? (
        <div
          ref={introLogoOverlayRef}
          className="pointer-events-none fixed z-[60] will-change-transform"
          style={introLogoOverlayStyle}
          aria-hidden
        >
          <GdgLogo mode="pc" variant="long" priority />
        </div>
      ) : null}
    </main>
  )
}
