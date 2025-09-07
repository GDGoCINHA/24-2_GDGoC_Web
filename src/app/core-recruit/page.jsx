"use client";

import { useState, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Button, Textarea, Input, Checkbox, Autocomplete, AutocompleteItem, AutocompleteSection } from '@nextui-org/react';
import axios from 'axios';
import { majorOptions } from '@/constant/majorOptions';

const TEAM_OPTIONS = ["HR", "BD", "TECH", "PR/DESIGN"];

export default function CoreRecruit() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    studentId: "",
    phone: "",
    major: "",
    email: "",
    team: "",
    motivation: "",
    wish: "",
    strengths: "",
    pledge: "",
  });

  const [files, setFiles] = useState([]);
  const [uploadedFileUrls, setUploadedFileUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleValueChange = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePreventEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files || []);
    const limited = selected.slice(0, 10);
    const filtered = limited.filter((f) => f.size <= 10 * 1024 * 1024);
    setFiles(filtered);
    setUploadedFileUrls([]);
    if (filtered.length === 0) return;
    try {
      setUploading(true);
      const urls = await Promise.all(
        filtered.map(async (file) => {
          try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/fileupload`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            const data = res?.data;
            const url = data?.url || data?.data?.url || data?.data?.[0]?.url || null;
            return url;
          } catch (err) {
            console.error('파일 업로드 실패:', file?.name, err);
            return null;
          }
        })
      );
      const successUrls = urls.filter((u) => !!u);
      setUploadedFileUrls(successUrls);
      if (successUrls.length !== filtered.length) {
        alert('일부 파일 업로드에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('파일 업로드 중 오류', err);
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const isValid = useMemo(() => {
    if (!form.name || !form.studentId || !form.phone || !form.major || !form.email) return false;
    if (!form.team) return false;
    if (!form.motivation || form.motivation.length > 500) return false;
    if (!form.wish || form.wish.length > 500) return false;
    if (!form.pledge || form.pledge.length > 100) return false;
    if (files.some((f) => f.size > 10 * 1024 * 1024) || files.length > 10) return false;
    if (files.length > 0 && uploadedFileUrls.length !== files.length) return false;
    return true;
  }, [form, files, uploadedFileUrls]);

  const handleSubmit = async () => {
    setTouched(true);
    if (!isValid) {
      alert("필수 항목을 확인해주세요.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        files: (files || []).map((f) => ({ name: f.name, size: f.size, type: f.type })),
        fileUrls: uploadedFileUrls,
      };
      console.log('[CoreRecruit Submit]', payload);
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/core-recruit`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      router.push('/core-recruit/submit');
    } catch (e) {
      alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col max-w-[900px] mx-auto min-h-[100svh] justify-start text-white py-16 px-6'>
      <h1
        className={`
          font-bold mb-6 flex items-center gap-3
          text-4xl
          tablet:text-3xl
          mobile:text-2xl
        `}
      >
        {/* 구글 로고 - 커스텀 그라데이션 적용 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 268.1522 273.8827"
          width="40"
          height="40"
          className="inline-block flex-shrink-0"
        >
          <defs>
            <linearGradient id="a">
              <stop offset="0" stopColor="#0fbc5c"/>
              <stop offset="1" stopColor="#0cba65"/>
            </linearGradient>
            <linearGradient id="g">
              <stop offset=".2312727" stopColor="#0fbc5f"/>
              <stop offset=".3115468" stopColor="#0fbc5f"/>
              <stop offset=".3660131" stopColor="#0fbc5e"/>
              <stop offset=".4575163" stopColor="#0fbc5d"/>
              <stop offset=".540305" stopColor="#12bc58"/>
              <stop offset=".6993464" stopColor="#28bf3c"/>
              <stop offset=".7712418" stopColor="#38c02b"/>
              <stop offset=".8605665" stopColor="#52c218"/>
              <stop offset=".9150327" stopColor="#67c30f"/>
              <stop offset="1" stopColor="#86c504"/>
            </linearGradient>
            <linearGradient id="h">
              <stop offset=".1416122" stopColor="#1abd4d"/>
              <stop offset=".2475151" stopColor="#6ec30d"/>
              <stop offset=".3115468" stopColor="#8ac502"/>
              <stop offset=".3660131" stopColor="#a2c600"/>
              <stop offset=".4456735" stopColor="#c8c903"/>
              <stop offset=".540305" stopColor="#ebcb03"/>
              <stop offset=".6156363" stopColor="#f7cd07"/>
              <stop offset=".6993454" stopColor="#fdcd04"/>
              <stop offset=".7712418" stopColor="#fdce05"/>
              <stop offset=".8605661" stopColor="#ffce0a"/>
            </linearGradient>
            <linearGradient id="f">
              <stop offset=".3159041" stopColor="#ff4c3c"/>
              <stop offset=".6038179" stopColor="#ff692c"/>
              <stop offset=".7268366" stopColor="#ff7825"/>
              <stop offset=".884534" stopColor="#ff8d1b"/>
              <stop offset="1" stopColor="#ff9f13"/>
            </linearGradient>
            <linearGradient id="b">
              <stop offset=".2312727" stopColor="#ff4541"/>
              <stop offset=".3115468" stopColor="#ff4540"/>
              <stop offset=".4575163" stopColor="#ff4640"/>
              <stop offset=".540305" stopColor="#ff473f"/>
              <stop offset=".6993464" stopColor="#ff5138"/>
              <stop offset=".7712418" stopColor="#ff5b33"/>
              <stop offset=".8605665" stopColor="#ff6c29"/>
              <stop offset="1" stopColor="#ff8c18"/>
            </linearGradient>
            <linearGradient id="d">
              <stop offset=".4084578" stopColor="#fb4e5a"/>
              <stop offset="1" stopColor="#ff4540"/>
            </linearGradient>
            <linearGradient id="c">
              <stop offset=".1315461" stopColor="#0cba65"/>
              <stop offset=".2097843" stopColor="#0bb86d"/>
              <stop offset=".2972969" stopColor="#09b479"/>
              <stop offset=".3962575" stopColor="#08ad93"/>
              <stop offset=".4771242" stopColor="#0aa6a9"/>
              <stop offset=".5684245" stopColor="#0d9cc6"/>
              <stop offset=".667385" stopColor="#1893dd"/>
              <stop offset=".7687273" stopColor="#258bf1"/>
              <stop offset=".8585063" stopColor="#3086ff"/>
            </linearGradient>
            <linearGradient id="e">
              <stop offset=".3660131" stopColor="#ff4e3a"/>
              <stop offset=".4575163" stopColor="#ff8a1b"/>
              <stop offset=".540305" stopColor="#ffa312"/>
              <stop offset=".6156363" stopColor="#ffb60c"/>
              <stop offset=".7712418" stopColor="#ffcd0a"/>
              <stop offset=".8605665" stopColor="#fecf0a"/>
              <stop offset=".9150327" stopColor="#fecf08"/>
              <stop offset="1" stopColor="#fdcd01"/>
            </linearGradient>
            <linearGradient xlinkHref="#a" id="s" x1="219.6997" y1="329.5351" x2="254.4673" y2="329.5351" gradientUnits="userSpaceOnUse"/>
            <radialGradient xlinkHref="#b" id="m" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-1.936885,1.043001,1.455731,2.555422,290.5254,-400.6338)" cx="109.6267" cy="135.8619" fx="109.6267" fy="135.8619" r="71.46001"/>
            <radialGradient xlinkHref="#c" id="n" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-3.512595,-4.45809,-1.692547,1.260616,870.8006,191.554)" cx="45.25866" cy="279.2738" fx="45.25866" fy="279.2738" r="71.46001"/>
            <radialGradient xlinkHref="#d" id="l" cx="304.0166" cy="118.0089" fx="304.0166" fy="118.0089" r="47.85445" gradientTransform="matrix(2.064353,-4.926832e-6,-2.901531e-6,2.592041,-297.6788,-151.7469)" gradientUnits="userSpaceOnUse"/>
            <radialGradient xlinkHref="#e" id="o" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-0.2485783,2.083138,2.962486,0.3341668,-255.1463,-331.1636)" cx="181.001" cy="177.2013" fx="181.001" fy="177.2013" r="71.46001"/>
            <radialGradient xlinkHref="#f" id="p" cx="207.6733" cy="108.0972" fx="207.6733" fy="108.0972" r="41.1025" gradientTransform="matrix(-1.249206,1.343263,-3.896837,-3.425693,880.5011,194.9051)" gradientUnits="userSpaceOnUse"/>
            <radialGradient xlinkHref="#g" id="r" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-1.936885,-1.043001,1.455731,-2.555422,290.5254,838.6834)" cx="109.6267" cy="135.8619" fx="109.6267" fy="135.8619" r="71.46001"/>
            <radialGradient xlinkHref="#h" id="j" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-0.081402,-1.93722,2.926737,-0.1162508,-215.1345,632.8606)" cx="154.8697" cy="145.9691" fx="154.8697" fy="145.9691" r="71.46001"/>
            <filter id="q" x="-.04842873" y="-.0582241" width="1.096857" height="1.116448" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="1.700914"/>
            </filter>
            <filter id="k" x="-.01670084" y="-.01009856" width="1.033402" height="1.020197" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation=".2419367"/>
            </filter>
            <clipPath clipPathUnits="userSpaceOnUse" id="i">
              <path d="M371.3784 193.2406H237.0825v53.4375h77.167c-1.2405 7.5627-4.0259 15.0024-8.1049 21.7862-4.6734 7.7723-10.4511 13.6895-16.373 18.1957-17.7389 13.4983-38.42 16.2584-52.7828 16.2584-36.2824 0-67.2833-23.2865-79.2844-54.9287-.4843-1.1482-.8059-2.3344-1.1975-3.5068-2.652-8.0533-4.101-16.5825-4.101-25.4474 0-9.226 1.5691-18.0575 4.4301-26.3985 11.2851-32.8967 42.9849-57.4674 80.1789-57.4674 7.4811 0 14.6854.8843 21.5173 2.6481 15.6135 4.0309 26.6578 11.9698 33.4252 18.2494l40.834-39.7111c-24.839-22.616-57.2194-36.3201-95.8444-36.3201-30.8782-.00066-59.3863 9.55308-82.7477 25.6992-18.9454 13.0941-34.4833 30.6254-44.9695 50.9861-9.75366 18.8785-15.09441 39.7994-15.09441 62.2934 0 22.495 5.34891 43.6334 15.10261 62.3374v.126c10.3023 19.8567 25.3678 36.9537 43.6783 49.9878 15.9962 11.3866 44.6789 26.5516 84.0307 26.5516 22.6301 0 42.6867-4.0517 60.3748-11.6447 12.76-5.4775 24.0655-12.6217 34.3012-21.8036 13.5247-12.1323 24.1168-27.1388 31.3465-44.4041 7.2297-17.2654 11.097-36.7895 11.097-57.957 0-9.858-.9971-19.8694-2.6881-28.9684Z" fill="#000"/>
            </clipPath>
          </defs>
          <g transform="matrix(0.957922,0,0,0.985255,-90.17436,-78.85577)">
            <g clipPath="url(#i)">
              <path d="M92.07563 219.9585c.14844 22.14 6.5014 44.983 16.11767 63.4234v.1269c6.9482 13.3919 16.4444 23.9704 27.2604 34.4518l65.326-23.67c-12.3593-6.2344-14.2452-10.0546-23.1048-17.0253-9.0537-9.0658-15.8015-19.4735-20.0038-31.677h-.1693l.1693-.1269c-2.7646-8.0587-3.0373-16.6129-3.1393-25.5029Z" fill="url(#j)" filter="url(#k)"/>
              <path d="M237.0835 79.02491c-6.4568 22.52569-3.988 44.42139 0 57.16129 7.4561.0055 14.6388.8881 21.4494 2.6464 15.6135 4.0309 26.6566 11.97 33.424 18.2496l41.8794-40.7256c-24.8094-22.58904-54.6663-37.2961-96.7528-37.33169Z" fill="url(#l)" filter="url(#k)"/>
              <path d="M236.9434 78.84678c-31.6709-.00068-60.9107 9.79833-84.8718 26.35902-8.8968 6.149-17.0612 13.2521-24.3311 21.1509-1.9045 17.7429 14.2569 39.5507 46.2615 39.3702 15.5284-17.9373 38.4946-29.5427 64.0561-29.5427.0233 0 .046.0019.0693.002l-1.0439-57.33536c-.0472-.00003-.0929-.00406-.1401-.00406Z" fill="url(#m)" filter="url(#k)"/>
              <path d="m341.4751 226.3788-28.2685 19.2848c-1.2405 7.5627-4.0278 15.0023-8.1068 21.7861-4.6734 7.7723-10.4506 13.6898-16.3725 18.196-17.7022 13.4704-38.3286 16.2439-52.6877 16.2553-14.8415 25.1018-17.4435 37.6749 1.0439 57.9342 22.8762-.0167 43.157-4.1174 61.0458-11.7965 12.9312-5.551 24.3879-12.7913 34.7609-22.0964 13.7061-12.295 24.4421-27.5034 31.7688-45.0003 7.3267-17.497 11.2446-37.2822 11.2446-58.7336Z" fill="url(#n)" filter="url(#k)"/>
              <path d="M234.9956 191.2104v57.4981h136.0062c1.1962-7.8745 5.1523-18.0644 5.1523-26.5001 0-9.858-.9963-21.899-2.6873-30.998Z" fill="#3086ff" filter="url(#k)"/>
              <path d="M128.3894 124.3268c-8.393 9.1191-15.5632 19.326-21.2483 30.3646-9.75351 18.8785-15.09402 41.8295-15.09402 64.3235 0 .317.02642.6271.02855.9436 4.31953 8.2244 59.66647 6.6495 62.45617 0-.0035-.3103-.0387-.6128-.0387-.9238 0-9.226 1.5696-16.0262 4.4306-24.3672 3.5294-10.2885 9.0557-19.7628 16.1223-27.9257 1.6019-2.0309 5.8748-6.3969 7.1214-9.0157.4749-.9975-.8621-1.5574-.9369-1.9085-.0836-.3927-1.8762-.0769-2.2778-.3694-1.2751-.9288-3.8001-1.4138-5.3334-1.8449-3.2772-.9215-8.7085-2.9536-11.7252-5.0601-9.5357-6.6586-24.417-14.6122-33.5047-24.2164Z" fill="url(#o)" filter="url(#k)"/>
              <path d="M162.0989 155.8569c22.1123 13.3013 28.4714-6.7139 43.173-12.9771L179.698 90.21568c-9.4075 3.92642-18.2957 8.80465-26.5426 14.50442-12.316 8.5122-23.192 18.8995-32.1763 30.7204Z" fill="url(#p)" filter="url(#q)"/>
              <path d="M171.0987 290.222c-29.6829 10.6413-34.3299 11.023-37.0622 29.2903 5.2213 5.0597 10.8312 9.74 16.7926 13.9835 15.9962 11.3867 46.766 26.5517 86.1178 26.5517.0462 0 .0904-.004.1366-.004v-59.1574c-.0298.0001-.064.002-.0938.002-14.7359 0-26.5113-3.8435-38.5848-10.5273-2.9768-1.6479-8.3775 2.7772-11.1229.799-3.7865-2.7284-12.8991 2.3508-16.1833-.9378Z" fill="url(#r)" filter="url(#k)"/>
              <path d="M219.6997 299.0227v59.9959c5.506.6402 11.2361 1.0289 17.2472 1.0289 6.0259 0 11.8556-.3073 17.5204-.8723v-59.7481c-6.3482 1.0777-12.3272 1.461-17.4776 1.461-5.9318 0-11.7005-.6858-17.29-1.8654Z" opacity=".5" fill="url(#s)" filter="url(#k)"/>
            </g>
          </g>
        </svg>
        <span
          className={`
            leading-tight
            break-keep
            whitespace-nowrap
            mobile:whitespace-normal
          `}
        >
          GDGoC INHA<wbr /> Core Member 지원
        </span>
      </h1>

      <div className='grid grid-cols-1 gap-14 mt-11'>
        <Input
          label='이름'
          isRequired
          value={form.name}
          onValueChange={handleValueChange('name')}
          variant='bordered'
          labelPlacement='outside'
          placeholder=' '
          disableAutoFocus
          className='!mt-[10px]'
          classNames={{
            mainWrapper: 'h-[57px] w-full',
            label: '!text-white text-xl pb-[18px] mobile:text-lg',
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white group-data-[focus=true]:border-[#bbbbbb30]`,
            input: 'text-lg mobile:text-base',
          }}
        />
        <Input
          label='학번'
          isRequired
          value={form.studentId}
          onValueChange={(value) => {
            const num = (value || '').replace(/\D/g, '').slice(0, 8);
            setForm((prev) => ({ ...prev, studentId: num }));
          }}
          variant='bordered'
          autoComplete='off'
          labelPlacement='outside'
          placeholder='8자리 학번을 입력해주세요'
          inputMode='numeric'
          disableAutoFocus
          className='!mt-[10px]'
          classNames={{
            mainWrapper: 'h-[57px] w-full',
            label: '!text-white text-xl pb-[18px] mobile:text-lg',
            inputWrapper: `h-[57px] border-[1.5px] rounded-md text-white text-xl mobile:text-lg !border-[#bbbbbb30] group-data-[focus=true]:!border-[#bbbbbb30] group-data-[hover=true]:!border-[#bbbbbb30]`,
            input: 'text-lg mobile:text-base',
            errorMessage: 'hidden',
          }}
        />
        <Input
          label='전화번호'
          isRequired
          value={form.phone}
          onValueChange={handleValueChange('phone')}
          variant='bordered'
          labelPlacement='outside'
          placeholder=' '
          inputMode='tel'
          disableAutoFocus
          className='!mt-[10px]'
          classNames={{
            mainWrapper: 'h-[57px] w-full',
            label: '!text-white text-xl pb-[18px] mobile:text-lg',
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white group-data-[focus=true]:border-[#bbbbbb30]`,
            input: 'text-lg mobile:text-base',
          }}
        />
        <div className='-mt-10'>
          <Autocomplete
            allowsCustomValue
            isRequired
            label='주전공'
            labelPlacement='outside'
            placeholder='검색 혹은 스크롤하여 지정하세요'
            className='!mt-14 w-96 mobile:w-[90vw]'
            classNames={{
              popoverContent: 'bg-[#1c1c1c]',
              selectorButton: 'text-white',
            }}
            inputProps={{
              classNames: {
                label: '!text-white text-xl pb-3 mobile:text-lg',
                inputWrapper:
                  'rounded-full bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]',
                input: '!text-white text-xl mobile:text-lg',
              },
              onKeyDown: handlePreventEnter,
            }}
            popoverProps={{
              classNames: {
                base: 'mt-3',
              },
            }}
            listboxProps={{
              classNames: {
                base: 'bg-[#1c1c1c] text-white',
              },
            }}
            selectedKeys={form.major}
            onSelectionChange={(value) => setForm((prev) => ({ ...prev, major: value }))}
          >
            {majorOptions.map((major) => (
              <AutocompleteSection title={major.title} key={major.title} showDivider>
                {major.items.map((item) => (
                  <AutocompleteItem key={item.key} aria-label={item.value} value={item.value}>
                    {item.value}
                  </AutocompleteItem>
                ))}
              </AutocompleteSection>
            ))}
          </Autocomplete>
        </div>
        <Input
          label='이메일'
          isRequired
          type='email'
          value={form.email}
          onValueChange={handleValueChange('email')}
          variant='bordered'
          labelPlacement='outside'
          placeholder=' '
          disableAutoFocus
          className='!mt-[10px]'
          classNames={{
            mainWrapper: 'h-[57px] w-full',
            label: '!text-white text-xl pb-[18px] mobile:text-lg',
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white group-data-[focus=true]:border-[#bbbbbb30]`,
            input: 'text-lg mobile:text-base',
          }}
        />

        <div>
          <div className='text-white text-xl'>팀</div>
          <div className='flex flex-wrap gap-4 mt-[20px] w-full mobile:gap-3'>
            {TEAM_OPTIONS.map((label) => (
              <Checkbox
                key={label}
                isSelected={form.team === label}
                onValueChange={() => setForm((prev) => ({ ...prev, team: label }))}
                radius='none'
                classNames={{
                  wrapper: 'hidden',
                  label: `text-white text-xl w-[150px] h-[57px] flex justify-center items-center rounded-md mobile:text-base mobile:w-[27vw] mobile:h-[49px] ${form.team === label ? 'bg-[#471915] border-[1.5px] border-[#ea4335]' : 'bg-[#181818]'}`,
                }}
              >
                {label}
              </Checkbox>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-white text-xl'>GDGoC INHA Core Member에 지원한 동기 (500자 이내) *</label>
          <Textarea
            minRows={5}
            maxLength={500}
            value={form.motivation}
            onValueChange={handleValueChange('motivation')}
            className='dark w-full rounded-2xl'
            labelPlacement='outside'
            placeholder='내용을 입력해주세요'
            classNames={{
              inputWrapper: 'border-1 border-[#ffffff34] rounded-2xl',
              input: '!text-white',
            }}
          />
          {touched && (!form.motivation || form.motivation.length > 500) && (
            <span className='text-[#EA4336] text-sm'>필수 입력이며 500자 이내로 작성해주세요.</span>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-white text-xl'>코어멤버로서 맡고 싶은 업무/프로젝트/행사/비전 (500자 이내)</label>
          <Textarea
            minRows={5}
            maxLength={500}
            value={form.wish}
            onValueChange={handleValueChange('wish')}
            className='dark w-full rounded-2xl'
            labelPlacement='outside'
            placeholder='내용을 입력해주세요'
            classNames={{
              inputWrapper: 'border-1 border-[#ffffff34] rounded-2xl',
              input: '!text-white',
            }}
          />
          {touched && (!form.wish || form.wish.length > 500) && (
            <span className='text-[#EA4336] text-sm'>필수 입력이며 500자 이내로 작성해주세요.</span>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-white text-xl'>장점/역량 (자유롭게)</label>
          <Textarea
            minRows={6}
            value={form.strengths}
            onValueChange={handleValueChange('strengths')}
            className='dark w-full rounded-2xl'
            labelPlacement='outside'
            placeholder='자유롭게 작성해주세요'
            classNames={{
              inputWrapper: 'border-1 border-[#ffffff34] rounded-2xl',
              input: '!text-white',
            }}
          />
          <div className='text-sm text-white/70'>
            예시: 리더십/꼼꼼함/성실함, 자격증, 스킬, 툴(피그마/노션), 수상/대외활동/인턴 등
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-white text-xl'>자료 첨부 (최대 10개, 파일당 10MB)</label>
          <input
            type='file'
            multiple
            onChange={handleFiles}
            className='file:mr-4 file:rounded-full file:border-0 file:bg-red-500 file:text-white file:px-4 file:py-2 file:hover:bg-red-600'
          />
          {files.length > 0 && (
            <div className='text-sm text-white/80'>선택된 파일: {files.length}개</div>
          )}
          {touched && (files.length > 10 || files.some((f)=> f.size > 10 * 1024 * 1024)) && (
            <span className='text-[#EA4336] text-sm'>파일 개수/크기 제한을 확인해주세요.</span>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-white text-xl'>Core Member로서의 각오 (100자 이내)</label>
          <Textarea
            minRows={3}
            maxLength={100}
            value={form.pledge}
            onValueChange={handleValueChange('pledge')}
            className='dark w-full rounded-2xl'
            labelPlacement='outside'
            placeholder='간단히 각오를 적어주세요'
            classNames={{
              inputWrapper: 'border-1 border-[#ffffff34] rounded-2xl',
              input: '!text-white',
            }}
          />
          {touched && (!form.pledge || form.pledge.length > 100) && (
            <span className='text-[#EA4336] text-sm'>필수 입력이며 100자 이내로 작성해주세요.</span>
          )}
        </div>

        <div className='rounded-xl bg-[#111111] p-5 border border-white/10'>
          <div className='text-lg font-semibold mb-4'>
            마지막으로 공지 및 일정을 확인해주시기 바랍니다!
          </div>
          <div className='space-y-6 text-white/90'>
            <div>
              <div className='text-xl font-bold mb-4'>모집 일정</div>
              <div className='mb-2'>✅ 서류 지원 기간 : 2025년 09월 8일 (월) ~ 2025년 09월 21일 (일) 11:59:59</div>
              <div className='mb-2'>✅ 서류 결과 발표 : ~ 2025년 09월 21일 (일)</div>
              <div className='mb-2'>✅ 면접 진행 기간 : 2025년 09월 22일 (월) ~ 2025년 09월 26일 (금)</div>
              <div className='text-white/70 text-sm mb-2'>※ 지원자 및 면접관의 일정에 따라 마감 전 조기 면접 진행이 가능할 수 있습니다.</div>
              <div className='mb-2'>✅ 최종 결과 발표 : ~ 2025년 09월 28일 (일)</div>
              <div className='mb-2'>❗️ 첫 온보딩 : 2025년 09월 30일 (화)</div>
            </div>
            <div className="border-t border-white/20 my-4" />
            <div>
              <div className='text-xl font-bold mb-4'>면접 안내</div>
              <div className='mb-2'>• 원칙적으로 대면 면접을 진행하며, 부득이한 경우에 한해 비대면으로 조정될 수 있습니다.</div>
              <div className='mb-2'>• 면접은 인하대학교 내부 장소에서 진행됩니다.</div>
            </div>
            <div className="border-t border-white/20 my-4" />
            <div>
              <div className='text-xl font-bold mb-4'>활동 안내</div>
              <div className='mb-2'>• 운영진으로 활동 시, 매주 화요일 19:00~21:00 정기 운영진 회의에 필수참석해야합니다.</div>
              <div className='mb-2'>• 단, 2시간 전체 참석이 아닌 최소 1시간 이상 필참을 원칙으로 합니다.</div>
            </div>
          </div>
        </div>
        <div className='flex w-full items-center justify-end'>
          <Checkbox
            isSelected={agreed}
            onValueChange={setAgreed}
            radius='none'
            color='danger'
            className='text-white text-base font-semibold'
            classNames={{
              wrapper: 'group-data-[selected=true]:after:bg-red-500',
              icon: 'bg-red-500',
            }}
          >
            공지사항 및 일정을 확인하였으며, 이에 동의합니다.
          </Checkbox>
        </div>

        <div className='flex justify-end gap-3 mt-6'>
          <Button
            className='bg-gray-500 text-white rounded-full w-[183px] h-[57px] text-lg font-semibold'
            onPress={() => window.history.back()}
          >이전</Button>
          <Button
            className='bg-red-500 text-white rounded-full w-[183px] h-[57px] text-lg font-semibold'
            onPress={handleSubmit}
            isDisabled={!isValid || !agreed || uploading || submitting}
            isLoading={uploading || submitting}
          >제출</Button>
        </div>
      </div>
    </div>
  );
}


