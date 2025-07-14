"use client";

import { useState } from "react";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css";
import Navigation from '@/components/Navigation';

// 목업 데이터 (2차원 배열)
const mockEmployees = [
  ["김민수", "개발팀", "팀장", "프론트엔드"],
  ["이서연", "개발팀", "사원", "백엔드"],
  ["박지훈", "기획팀", "대리", "기획"],
  ["최유진", "디자인팀", "과장", "UI/UX"],
  ["정우성", "개발팀", "사원", "프론트엔드"],
  ["한지민", "기획팀", "팀장", "PM"],
  ["오세훈", "디자인팀", "사원", "그래픽"],
  ["김지수", "개발팀", "과장", "백엔드"],
  ["이준호", "기획팀", "사원", "기획"],
  ["장예린", "디자인팀", "대리", "UI/UX"],
  ["서지훈", "개발팀", "대리", "프론트엔드"],
  ["문채원", "기획팀", "과장", "PM"],
  ["이하늘", "디자인팀", "팀장", "그래픽"],
  ["박서준", "개발팀", "사원", "백엔드"],
  ["김하늘", "기획팀", "사원", "기획"],
  ["최지우", "디자인팀", "사원", "UI/UX"],
  ["이수빈", "개발팀", "과장", "프론트엔드"],
  ["정지훈", "기획팀", "대리", "PM"],
  ["한예슬", "디자인팀", "대리", "그래픽"],
  ["오지현", "개발팀", "팀장", "백엔드"],
];

const columns = [
  { data: 0, type: "text" },
  { data: 1, type: "text" },
  { data: 2, type: "text" },
  { data: 3, type: "text" },
];

function unique(arr: string[]) {
  return Array.from(new Set(arr));
}

export default function TalentManagementPage() {
  const [filters, setFilters] = useState({
    name: "",
    department: "",
    position: "",
    role: "",
  });
  const [data, setData] = useState(mockEmployees);

  // 필터링된 데이터 계산
  const filteredData = data.filter(row =>
    (filters.name === "" || row[0].includes(filters.name)) &&
    (filters.department === "" || row[1] === filters.department) &&
    (filters.position === "" || row[2] === filters.position) &&
    (filters.role === "" || row[3] === filters.role)
  );

  // select 옵션 추출
  const departments = unique(mockEmployees.map(e => e[1]));
  const positions = unique(mockEmployees.map(e => e[2]));
  const roles = unique(mockEmployees.map(e => e[3]));

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <main className="lg:pl-64 pl-0 min-h-screen bg-secondary-50 flex flex-col items-center">
        <h1 className="text-3xl font-bold mt-10 mb-8 text-gray-800 text-center w-full">인재 관리</h1>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl min-w-0 bg-white p-2 shadow-sm border border-gray-100 mx-auto">
          {/* 필터 UI */}
          <div className="flex flex-wrap gap-2 mb-4 items-center justify-center">
            <input
              type="text"
              placeholder="이름 검색"
              value={filters.name}
              onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-2 w-40"
            />
            <select
              value={filters.department}
              onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-2 w-40"
            >
              <option value="">부서 전체</option>
              {departments.map(dep => (
                <option key={dep as string} value={dep as string}>{dep as string}</option>
              ))}
            </select>
            <select
              value={filters.position}
              onChange={e => setFilters(f => ({ ...f, position: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-2 w-40"
            >
              <option value="">직책 전체</option>
              {positions.map(pos => (
                <option key={pos as string} value={pos as string}>{pos as string}</option>
              ))}
            </select>
            <select
              value={filters.role}
              onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-2 w-40"
            >
              <option value="">직무 전체</option>
              {roles.map(role => (
                <option key={role as string} value={role as string}>{role as string}</option>
              ))}
            </select>
          </div>
          <div className="w-full min-w-0">
            <HotTable
              data={filteredData}
              colHeaders={["이름", "부서", "직책", "직무"]}
              columns={columns}
              rowHeaders={true}
              width="100%"
              height="auto"
              stretchH="all"
              licenseKey="non-commercial-and-evaluation"
              className="text-lg"
              afterChange={(_, source) => {
                if (source === "edit") setData([...data]);
              }}
              language="ko-KR"
              dropdownMenu={true}
              filters={true}
              manualColumnResize={true}
              manualRowResize={true}
              columnSorting={true}
              autoWrapRow={true}
              autoWrapCol={true}
              colWidths={[160, 160, 160, 200]}
              rowHeights={56}
            />
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}