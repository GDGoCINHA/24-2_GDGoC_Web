'use client';

import React, { useMemo } from 'react';
import { formatMajorLabel } from '@/constant/majorOptions';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#FF8042', '#FFBB28', '#00C49F', '#0088FE'];

function normalizeMembers(rawMembers = []) {
  return rawMembers.map((u) => ({
    id: u?.id ?? u?.member?.id,
    name: u?.name ?? u?.member?.name ?? '',
    major: formatMajorLabel(u?.major ?? u?.member?.major ?? u?.member?.majors?.main ?? '기타'),
    admissionSemester: u?.admissionSemester ?? u?.member?.admissionSemester ?? '미상',
    studentId: String(u?.studentId ?? u?.member?.studentId ?? ''),
    isPayed: typeof (u?.isPayed ?? u?.member?.isPayed) === 'boolean' ? (u?.isPayed ?? u?.member?.isPayed) : false,
    createdAt: u?.createdAt ?? u?.member?.createdAt ?? null,
  }));
}

function buildSemesterData(members) {
  const map = new Map();
  members.forEach((m) => {
    const key = m.admissionSemester || '미상';
    map.set(key, (map.get(key) || 0) + 1);
  });
  const arr = Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  return arr;
}

function buildMajorTopData(members, topN = 5) {
  const map = new Map();
  members.forEach((m) => {
    const key = m.major || '기타';
    map.set(key, (map.get(key) || 0) + 1);
  });
  const arr = Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
  return arr;
}

function buildPaymentData(members) {
  let paid = 0;
  let unpaid = 0;
  members.forEach((m) => (m.isPayed ? (paid += 1) : (unpaid += 1)));
  return [
    { name: '입금', value: paid },
    { name: '미입금', value: unpaid },
  ];
}

function buildSemesterPaymentStackData(members) {
  const map = new Map();
  members.forEach((m) => {
    const key = m.admissionSemester || '미상';
    const item = map.get(key) || { name: key, 입금: 0, 미입금: 0 };
    if (m.isPayed) item['입금'] += 1;
    else item['미입금'] += 1;
    map.set(key, item);
  });
  return Array.from(map.values()).sort((a, b) => (b['입금'] + b['미입금']) - (a['입금'] + a['미입금']));
}

function buildStudentIdYearData(members) {
  const map = new Map();
  members.forEach((m) => {
    const raw = m.studentId || '';
    if (raw.length >= 4) {
      const yy = raw.substring(2, 4);
      if (/^\d{2}$/.test(yy)) {
        const label = `${yy}학번`;
        map.set(label, (map.get(label) || 0) + 1);
      }
    }
  });
  const arr = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  arr.sort((a, b) => parseInt(b.name, 10) - parseInt(a.name, 10));
  return arr;
}

export default function AdminDashboard({ members = [], totalCount }) {
  const normalized = useMemo(() => normalizeMembers(members), [members]);

  const semesterData = useMemo(() => buildSemesterData(normalized), [normalized]);
  const majorTopData = useMemo(() => buildMajorTopData(normalized), [normalized]);
  const paymentData = useMemo(() => buildPaymentData(normalized), [normalized]);
  const semesterPaymentStack = useMemo(() => buildSemesterPaymentStackData(normalized), [normalized]);
  const studentIdYearData = useMemo(() => buildStudentIdYearData(normalized), [normalized]);

  const totalMembers = totalCount ?? normalized.length;
  const paidCount = paymentData.find((d) => d.name === '입금')?.value ?? 0;
  const paidRate = totalMembers ? Math.round((paidCount / totalMembers) * 100) : 0;
  const topSemester = semesterData[0]?.name ?? '미상';
  const topSemesterCount = semesterData[0]?.value ?? 0;

  return (
    <div className="px-[96px] mobile:px-[10px] pb-[40px] text-white">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4 bg-[#2b2b2f] rounded-lg p-4">
          <div className="text-sm text-gray-300">총 멤버 수</div>
          <div className="text-2xl font-bold">{totalMembers}</div>
        </div>
        <div className="col-span-12 md:col-span-4 bg-[#2b2b2f] rounded-lg p-4">
          <div className="text-sm text-gray-300">입금 완료율</div>
          <div className="text-2xl font-bold">{paidRate}%</div>
        </div>
        <div className="col-span-12 md:col-span-4 bg-[#2b2b2f] rounded-lg p-4">
          <div className="text-sm text-gray-300">최다 입학학기</div>
          <div className="text-2xl font-bold">{topSemester} <span className="text-base font-normal">({topSemesterCount})</span></div>
        </div>

        <div className="col-span-12 md:col-span-6 bg-[#2b2b2f] rounded-lg p-4">
          <div className="text-sm text-gray-300 mb-2">입학학기 분포</div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semesterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" interval={0} />
                <YAxis allowDecimals={false} stroke="#aaa" />
                <Tooltip contentStyle={{ backgroundColor: '#1f1f23', border: 'none' }} />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 bg-[#2b2b2f] rounded-lg p-4">
          <div className="text-sm text-gray-300 mb-2">납부 현황</div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8" label>
                  {paymentData.map((entry, index) => (
                    <Cell key={`p-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: '#1f1f23', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 bg-[#2b2b2f] rounded-lg p-4">
          <div className="text-sm text-gray-300 mb-2">학번(입학년도) 분포</div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentIdYearData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" interval={0} />
                <YAxis allowDecimals={false} stroke="#aaa" />
                <Tooltip contentStyle={{ backgroundColor: '#1f1f23', border: 'none' }} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 bg-[#2b2b2f] rounded-lg p-4">
          <div className="text-sm text-gray-300 mb-2">입학학기별 납부 상태 (Stacked)</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semesterPaymentStack} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" interval={0} />
                <YAxis allowDecimals={false} stroke="#aaa" />
                <Tooltip contentStyle={{ backgroundColor: '#1f1f23', border: 'none' }} />
                <Legend />
                <Bar dataKey="입금" stackId="a" fill="#00C49F" />
                <Bar dataKey="미입금" stackId="a" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 bg-[#2b2b2f] rounded-lg p-4">
          <div className="text-sm text-gray-300 mb-2">학과 Top 5</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={majorTopData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} stroke="#aaa" />
                <Tooltip contentStyle={{ backgroundColor: '#1f1f23', border: 'none' }} />
                <Bar dataKey="value" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

