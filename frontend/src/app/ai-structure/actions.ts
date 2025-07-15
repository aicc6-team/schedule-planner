'use server';

export async function callOpenAI(
  prompt: string,
  model: string = 'gpt-4o-mini',
  maxTokens: number = 1000,
  temperature: number = 0.7
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: '당신은 일정 관리 전문가입니다. 일정 충돌을 분석하고 최적의 해결책을 제시해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: `OpenAI API 오류: ${errorData.error?.message || '알 수 없는 오류'}` 
      };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';

    return { success: true, content };

  } catch (error) {
    console.error('OpenAI API 호출 실패:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    };
  }
}

// LLM 프롬프트 생성 함수 (6가지 프롬프트 설계 원칙 적용)
export async function createLLMPrompt(
  conflictGroupData: any[],
  allSchedules: any[],
  selectedGroupIndex: number = 0
): Promise<string> {
  // ⛳ 1. 명확하고 구체적으로: 분석 목적, 데이터 구조, 기대 결과 명시
  // ⛳ 2. 배경 맥락: 일정 관리 서비스, 충돌 그룹, 우선순위 정책 등
  // ⛳ 3. 구분자 사용: JSON, 코드 블록, 주석 등으로 구분
  // ⛳ 4. 단계별 구조화: 데이터 설명 → 분석 요청 → 조정안 예시
  // ⛳ 5. 예시 포함: 입력/출력 예시 제공
  // ⛳ 6. 비교/테스트: 프롬프트 버전별 효과 비교 가능

  const conflictSchedules = conflictGroupData.map(schedule => ({
    id: schedule.id,
    title: schedule.title,
    description: schedule.description || '',
    startTime: new Date(schedule.startTime).toLocaleString('ko-KR'),
    endTime: new Date(schedule.endTime).toLocaleString('ko-KR'),
    priority: schedule.priority,
    type: schedule.type,
    duration: Math.round((new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime()) / (1000 * 60))
  }));

  const allSchedulesFormatted = allSchedules.map(schedule => ({
    id: schedule.id,
    title: schedule.title,
    description: schedule.description || '',
    startTime: new Date(schedule.startTime).toLocaleString('ko-KR'),
    endTime: new Date(schedule.endTime).toLocaleString('ko-KR'),
    priority: schedule.priority,
    type: schedule.type
  }));

  return `
# 🎯 일정 충돌 AI 분석 요청

## 📊 [분석 대상 데이터]

### 🔴 충돌 그룹 ${selectedGroupIndex + 1} (선택된 그룹)
\`\`\`json
${JSON.stringify(conflictSchedules, null, 2)}
\`\`\`

### 📅 전체 일정 목록 (참고용)
\`\`\`json
${JSON.stringify(allSchedulesFormatted.slice(0, 20), null, 2)}
\`\`\`

## 🔍 [분석 요청 사항]

### ① 충돌 진단
- **시간 충돌**: 겹치는 시간대와 충돌 정도 분석
- **리소스 과부하**: 담당자/참여자 관점에서의 과부하 진단
- **우선순위 충돌**: 중요도/긴급성 기준 충돌 분석

### ② 실무적 조정안 제시
- **즉시 적용 가능한 조정**: 시간 변경, 담당자 조정, 일정 분할 등
- **우선순위 기반 조정**: 중요도/긴급성에 따른 일정 재배치
- **리소스 최적화**: 참여자 부담 분산 방안

### ③ 생산성 향상 전략
- **일정 구성 개선**: 효율적인 시간 배분 방안
- **업무 프로세스 최적화**: 반복 일정, 연관 일정 그룹화 등

## 📋 [출력 형식 예시]

\`\`\`json
{
  "분석_요약": {
    "충돌_유형": ["시간 충돌", "리소스 과부하"],
    "영향도": "높음/중간/낮음",
    "긴급도": "높음/중간/낮음"
  },
  "조정안": [
    {
      "제안_유형": "시간 변경/담당자 조정/일정 분할",
      "대상_일정": "일정 ID 또는 제목",
      "구체적_조정": "새로운 시간 또는 담당자",
      "조정_사유": "조정이 필요한 이유",
      "기대_효과": "조정 후 예상 효과",
      "적용_난이도": "높음/중간/낮음"
    }
  ],
  "추가_전략": {
    "일정_구성_개선": "효율적인 시간 배분 방안",
    "업무_프로세스_최적화": "반복 일정 관리 방안",
    "예방_조치": "향후 충돌 방지 방안"
  },
  "우선순위_권장사항": {
    "즉시_적용": ["조정안 1", "조정안 2"],
    "단계적_적용": ["조정안 3", "조정안 4"],
    "장기_검토": ["전략 1", "전략 2"]
  }
}
\`\`\`

## ⚠️ [주의사항]
- 모든 조정안은 실제 업무 환경에서 적용 가능해야 함
- 각 조정안의 구체적 사유와 기대 효과를 명시
- 우선순위와 긴급성을 고려한 실용적 제안
- JSON 형식으로 정확히 응답 (마크다운 코드 블록 사용 금지)
`;
}

// 개선된 일정 충돌 분석 함수
export async function analyzeScheduleConflicts(
  conflictingSchedules: any[],
  allSchedules: any[],
  selectedGroupIndex: number = 0
): Promise<{ success: boolean; content?: string; error?: string; data?: any }> {
  try {
    // 선택된 충돌 그룹만 분석 대상으로 삼기
    const conflictGroups = getConflictGroups(conflictingSchedules);
    const targetGroup = conflictGroups[selectedGroupIndex] || conflictingSchedules;
    
    // 개선된 프롬프트 생성
    const prompt = await createLLMPrompt(targetGroup, allSchedules, selectedGroupIndex);
    
    // LLM 호출 (더 긴 토큰과 낮은 온도로 정확성 향상)
    const result = await callOpenAI(prompt, 'gpt-4o-mini', 2000, 0.2);
    
    if (!result.success) {
      return result;
    }
    
    // JSON 파싱 시도 (코드블록 우선, 없으면 전체 응답에서 시도)
    let parsedData = null;
    try {
      const jsonMatch = result.content?.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else if (result.content?.trim().startsWith('{')) {
        // 코드블록이 없고, 순수 JSON만 반환된 경우
        parsedData = JSON.parse(result.content.trim());
      }
    } catch (parseError) {
      console.warn('JSON 파싱 실패, 원본 텍스트 반환:', parseError);
    }
    
    if (parsedData) {
      return {
        success: true,
        content: formatAnalysisResult(parsedData),
        data: parsedData
      };
    }
    
    return result;
    
  } catch (error) {
    console.error('일정 충돌 분석 실패:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.' 
    };
  }
}

// 충돌 그룹 분류 함수 (기존 로직 활용)
function getConflictGroups(schedules: any[]): any[][] {
  const groups: any[][] = [];
  const visited = new Set<string>();
  
  for (const schedule of schedules) {
    if (visited.has(schedule.id)) continue;
    
    const group = [schedule];
    visited.add(schedule.id);
    
    // 충돌하는 다른 일정들 찾기
    for (const other of schedules) {
      if (visited.has(other.id)) continue;
      
      if (hasTimeConflict(schedule, other)) {
        group.push(other);
        visited.add(other.id);
      }
    }
    
    if (group.length > 0) {
      groups.push(group);
    }
  }
  
  return groups;
}

// 시간 충돌 확인 함수
function hasTimeConflict(schedule1: any, schedule2: any): boolean {
  const start1 = new Date(schedule1.startTime);
  const end1 = new Date(schedule1.endTime);
  const start2 = new Date(schedule2.startTime);
  const end2 = new Date(schedule2.endTime);
  
  return start1 < end2 && start2 < end1;
}

// 분석 결과 포맷팅 함수
function formatAnalysisResult(data: any): string {
  let formatted = '';

  // 분석 요약
  if (data.분석_요약) {
    formatted += '[충돌 분석 요약]\n';
    formatted += `- 충돌 유형: ${data.분석_요약.충돌_유형?.join(', ') || '분석 중'}\n`;
    formatted += `- 영향도: ${data.분석_요약.영향도 || '분석 중'}\n`;
    formatted += `- 긴급도: ${data.분석_요약.긴급도 || '분석 중'}\n\n`;
  }

  // 조정안
  if (data.조정안 && data.조정안.length > 0) {
    formatted += '[실무적 조정안]\n';
    data.조정안.forEach((adjustment: any, index: number) => {
      formatted += `${index + 1}. `;
      if (adjustment.제안_유형 && adjustment.대상_일정) {
        formatted += `${adjustment.대상_일정}의 `;
        if (adjustment.제안_유형.includes('시간 변경')) {
          formatted += `시간을 ${adjustment.구체적_조정}로 변경하세요.`;
        } else if (adjustment.제안_유형.includes('일정 분할')) {
          formatted += `일정을 분할하세요. (${adjustment.구체적_조정})`;
        } else if (adjustment.제안_유형.includes('담당자 조정')) {
          formatted += `담당자를 조정하세요. (${adjustment.구체적_조정})`;
        } else {
          formatted += `${adjustment.구체적_조정}`;
        }
      } else {
        formatted += `${adjustment.구체적_조정}`;
      }
      if (adjustment.조정_사유) {
        formatted += `\n   사유: ${adjustment.조정_사유}`;
      }
      if (adjustment.기대_효과) {
        formatted += `\n   기대 효과: ${adjustment.기대_효과}`;
      }
      if (adjustment.적용_난이도) {
        formatted += `\n   적용 난이도: ${adjustment.적용_난이도}`;
      }
      formatted += '\n';
    });
    formatted += '\n';
  }

  // 추가 전략
  if (data.추가_전략) {
    formatted += '[추가 최적화 전략]\n';
    if (data.추가_전략.일정_구성_개선) {
      formatted += `- ${data.추가_전략.일정_구성_개선}\n`;
    }
    if (data.추가_전략.업무_프로세스_최적화) {
      formatted += `- ${data.추가_전략.업무_프로세스_최적화}\n`;
    }
    if (data.추가_전략.예방_조치) {
      formatted += `- ${data.추가_전략.예방_조치}\n`;
    }
    formatted += '\n';
  }

  // 우선순위 권장사항
  if (data.우선순위_권장사항) {
    formatted += '[우선순위별 권장사항]\n';
    if (data.우선순위_권장사항.즉시_적용 && data.우선순위_권장사항.즉시_적용.length > 0) {
      formatted += `- 즉시 적용: ${data.우선순위_권장사항.즉시_적용.join(', ')}\n`;
    }
    if (data.우선순위_권장사항.단계적_적용 && data.우선순위_권장사항.단계적_적용.length > 0) {
      formatted += `- 단계적 적용: ${data.우선순위_권장사항.단계적_적용.join(', ')}\n`;
    }
    if (data.우선순위_권장사항.장기_검토 && data.우선순위_권장사항.장기_검토.length > 0) {
      formatted += `- 장기 검토: ${data.우선순위_권장사항.장기_검토.join(', ')}\n`;
    }
    formatted += '\n';
  }

  return formatted.trim() || '분석 결과를 포맷팅할 수 없습니다.';
}

export async function testOpenAIConnection(): Promise<{ success: boolean; content?: string; error?: string }> {
  const prompt = '안녕하세요! 일정 관리 AI 어시스턴트입니다. 현재 정상적으로 작동하고 있습니다.';
  return await callOpenAI(prompt, 'gpt-4o-mini', 100, 0.7);
} 