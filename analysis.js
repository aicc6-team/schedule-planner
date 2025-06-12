// Firebase 초기화 - 데이터베이스 연결 설정
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 차트에 사용할 색상 정의
const chartColors = {
    primary: '#3498db',    // 주요 색상 (파란색)
    secondary: '#2ecc71',  // 보조 색상 (초록색)
    tertiary: '#e74c3c',   // 세 번째 색상 (빨간색)
    quaternary: '#f1c40f', // 네 번째 색상 (노란색)
    background: '#f8f9fa'  // 배경 색상 (연한 회색)
};

// 중요도별 할일 분포를 보여주는 파이 차트 생성
function createPriorityChart(data) {
    // 차트를 그릴 캔버스 요소 가져오기
    const ctx = document.getElementById('priorityChart').getContext('2d');
    
    // 각 중요도별 할일 개수 계산 (한글, 영문 모두 지원)
    const highCount = data.filter(todo => 
        todo.priority === 'high' || todo.priority === '높음'
    ).length;
    
    const mediumCount = data.filter(todo => 
        todo.priority === 'medium' || todo.priority === '중간' || todo.priority === '보통'
    ).length;
    
    const lowCount = data.filter(todo => 
        todo.priority === 'low' || todo.priority === '낮음'
    ).length;
    
    // Chart.js를 사용하여 파이 차트 생성
    new Chart(ctx, {
        type: 'pie', // 파이 차트 타입
        data: {
            labels: ['높음', '중간', '낮음'], // 차트 레이블
            datasets: [{
                data: [highCount, mediumCount, lowCount],
                backgroundColor: [chartColors.tertiary, chartColors.quaternary, chartColors.secondary]
            }]
        },
        options: {
            responsive: true, // 반응형 차트
            plugins: {
                legend: {
                    position: 'bottom' // 범례 위치
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = highCount + mediumCount + lowCount;
                            const value = context.raw;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${value}개 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 시간대별 할일 분포를 보여주는 막대 차트 생성
function createTimeChart(data) {
    // 24시간 시간대 생성
    const timeSlots = Array.from({length: 24}, (_, i) => i);
    
    // 각 시간대별 할일 개수 계산
    const counts = timeSlots.map(hour => {
        return data.filter(todo => {
            if (!todo.time) return false;
            
            // time 필드에서 시간 추출 (HH:MM 형식 가정)
            let todoHour;
            if (typeof todo.time === 'string' && todo.time.includes(':')) {
                todoHour = parseInt(todo.time.split(':')[0]);
            } else {
                return false;
            }
            
            return todoHour === hour;
        }).length;
    });

    // 차트를 그릴 캔버스 요소 가져오기
    const ctx = document.getElementById('timeChart').getContext('2d');
    
    // Chart.js를 사용하여 막대 차트 생성
    new Chart(ctx, {
        type: 'bar', // 막대 차트 타입
        data: {
            labels: timeSlots.map(hour => `${hour}시`), // x축 레이블
            datasets: [{
                label: '할일 수', // 데이터셋 레이블
                data: counts, // 각 시간대별 할일 수
                backgroundColor: chartColors.primary
            }]
        },
        options: {
            responsive: true, // 반응형 차트
            scales: {
                y: {
                    beginAtZero: true, // y축 0부터 시작
                    ticks: {
                        stepSize: 1 // y축 눈금 간격
                    }
                }
            }
        }
    });
}

// 마감일 전 완료율을 보여주는 차트 생성
function createDeadlineCompletionChart(data) {
    // 마감일 대비 완료 시간 계산
    const deadlineData = data.filter(todo => todo.completed && todo.date).map(todo => {
        // 완료 날짜와 마감 날짜
        const completedDate = new Date(todo.completedAt);
        const deadlineDate = new Date(todo.date);
        
        // 완료 시간에서 마감일까지 남은 시간(시간 단위)
        const hoursDiff = (deadlineDate - completedDate) / (1000 * 60 * 60);
        
        // 카테고리 분류: 당일 완료, 하루 전, 3일 전, 일주일 전, 일주일 이상 전
        let category;
        if (hoursDiff < 0) {
            category = '마감일 이후';
        } else if (hoursDiff < 24) {
            category = '당일 완료';
        } else if (hoursDiff < 72) {
            category = '1~3일 전';
        } else if (hoursDiff < 168) {
            category = '3~7일 전';
        } else {
            category = '7일 이상 전';
        }
        
        return { category, hoursDiff };
    });
    
    // 각 카테고리별 카운트
    const categories = ['마감일 이후', '당일 완료', '1~3일 전', '3~7일 전', '7일 이상 전'];
    const counts = categories.map(category => 
        deadlineData.filter(data => data.category === category).length
    );
    
    // 전체 완료된 할일 대비 비율 계산
    const total = counts.reduce((sum, count) => sum + count, 0);
    const percentages = counts.map(count => total > 0 ? ((count / total) * 100).toFixed(1) : 0);
    
    // 차트를 그릴 캔버스 요소 가져오기
    const ctx = document.getElementById('deadlineCompletionChart').getContext('2d');
    
    // Chart.js를 사용하여 막대 차트 생성
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: '완료 비율 (%)',
                data: percentages,
                backgroundColor: [
                    '#e74c3c', // 마감일 이후 (빨간색)
                    '#f1c40f', // 당일 완료 (노란색)
                    '#2ecc71', // 1~3일 전 (초록색)
                    '#3498db', // 3~7일 전 (파란색)
                    '#9b59b6'  // 7일 이상 전 (보라색)
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '비율 (%)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const count = counts[context.dataIndex];
                            return [`완료 비율: ${context.raw}%`, `완료 건수: ${count}건`];
                        }
                    }
                }
            }
        }
    });
}

// 주간 트렌드를 보여주는 선 차트 생성
function createTrendChart(data) {
    // 최근 7일 날짜 생성
    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();

    // 각 날짜별 완료된 할일 개수 계산
    const completedCounts = last7Days.map(date =>
        data.filter(todo => 
            todo.completed && todo.date === date
        ).length
    );

    // 차트를 그릴 캔버스 요소 가져오기
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    // Chart.js를 사용하여 선 차트 생성
    new Chart(ctx, {
        type: 'line', // 선 차트 타입
        data: {
            labels: last7Days.map(date => date.slice(5)), // x축 레이블 (월-일)
            datasets: [{
                label: '완료된 할일', // 데이터셋 레이블
                data: completedCounts, // 각 날짜별 완료된 할일 수
                borderColor: chartColors.secondary,
                tension: 0.1 // 선 곡률
            }]
        },
        options: {
            responsive: true, // 반응형 차트
            scales: {
                y: {
                    beginAtZero: true, // y축 0부터 시작
                    ticks: {
                        stepSize: 1 // y축 눈금 간격
                    }
                }
            }
        }
    });
}

// 생산성 추이를 보여주는 선 차트 생성
function createProductivityChart(data) {
    // 날짜별 완료율 데이터 계산
    const productivityData = data.reduce((acc, todo) => {
        const date = todo.date;
        if (!acc[date]) {
            acc[date] = { completed: 0, total: 0 };
        }
        acc[date].total++;
        if (todo.completed) {
            acc[date].completed++;
        }
        return acc;
    }, {});

    // 날짜 정렬 및 완료율 계산
    const dates = Object.keys(productivityData).sort();
    const productivity = dates.map(date => 
        (productivityData[date].completed / productivityData[date].total) * 100
    );

    // 차트를 그릴 캔버스 요소 가져오기
    const ctx = document.getElementById('productivityChart').getContext('2d');
    
    // Chart.js를 사용하여 선 차트 생성
    new Chart(ctx, {
        type: 'line', // 선 차트 타입
        data: {
            labels: dates.map(date => date.slice(5)), // x축 레이블 (월-일)
            datasets: [{
                label: '생산성 (%)', // 데이터셋 레이블
                data: productivity, // 각 날짜별 생산성
                borderColor: chartColors.primary,
                tension: 0.1 // 선 곡률
            }]
        },
        options: {
            responsive: true, // 반응형 차트
            scales: {
                y: {
                    beginAtZero: true, // y축 0부터 시작
                    max: 100, // 최대값 100%
                    ticks: {
                        callback: value => value + '%' // y축 눈금에 % 표시
                    }
                }
            }
        }
    });
}

// 중요도-반복 매트릭스 차트 기능 구현
function createMatrixChart(data) {
    // 매트릭스 각 사분면 요소 가져오기
    const q1 = document.querySelector('.matrix-quadrant.q1'); // 높은 중요도, 1회성
    const q2 = document.querySelector('.matrix-quadrant.q2'); // 낮은 중요도, 1회성
    const q3 = document.querySelector('.matrix-quadrant.q3'); // 낮은 중요도, 반복적
    const q4 = document.querySelector('.matrix-quadrant.q4'); // 높은 중요도, 반복적
    
    // 기존 내용 초기화 (제목과 설명 제외)
    q1.querySelectorAll('.matrix-item').forEach(item => item.remove());
    q2.querySelectorAll('.matrix-item').forEach(item => item.remove());
    q3.querySelectorAll('.matrix-item').forEach(item => item.remove());
    q4.querySelectorAll('.matrix-item').forEach(item => item.remove());
    
    // 반복성 여부 판단 (같은 제목이 반복되는지 확인)
    const titleCounts = {};
    data.forEach(todo => {
        if (todo.title) {
            titleCounts[todo.title] = (titleCounts[todo.title] || 0) + 1;
        }
    });
    
    // 각 할 일을 매트릭스에 분류
    data.forEach(todo => {
        if (!todo.title) return; // 제목이 없는 항목은 건너뜀
        
        // 중요도 분류 (high/medium/low 또는 한글)
        const isHighPriority = todo.priority === 'high' || todo.priority === '높음';
        const isLowPriority = todo.priority === 'low' || todo.priority === '낮음';
        
        // 반복성 분류 (같은 제목의 일정이 2개 이상이면 반복적으로 판단)
        const isRecurring = titleCounts[todo.title] >= 2;
        
        // 어느 사분면에 속하는지 결정
        let quadrant;
        if (isHighPriority && !isRecurring) {
            quadrant = q1; // 높은 중요도, 1회성
        } else if (!isHighPriority && !isRecurring) {
            quadrant = q2; // 낮은 중요도, 1회성
        } else if (!isHighPriority && isRecurring) {
            quadrant = q3; // 낮은 중요도, 반복적
        } else {
            quadrant = q4; // 높은 중요도, 반복적
        }
        
        // 중복 항목 방지 (이미 같은 이름의 항목이 있는지 확인)
        const existingItem = Array.from(quadrant.querySelectorAll('.matrix-item'))
            .find(item => item.textContent === todo.title);
        
        if (!existingItem) {
            // 새 항목 생성 및 추가
            const itemElement = document.createElement('div');
            itemElement.className = 'matrix-item';
            itemElement.textContent = todo.title;
            
            // 항목의 우선순위를 색상으로 구분
            if (isHighPriority) {
                itemElement.style.borderLeft = '3px solid #e74c3c';
            } else if (isLowPriority) {
                itemElement.style.borderLeft = '3px solid #2ecc71';
            } else {
                itemElement.style.borderLeft = '3px solid #f1c40f';
            }
            
            // 최대 3개까지만 표시
            if (quadrant.querySelectorAll('.matrix-item').length < 3) {
                quadrant.appendChild(itemElement);
            }
        }
    });
    
    // 각 사분면에 항목이 없는 경우 "데이터 없음" 메시지 표시
    [q1, q2, q3, q4].forEach(quadrant => {
        if (quadrant.querySelectorAll('.matrix-item').length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'matrix-item';
            emptyItem.textContent = '데이터 없음';
            emptyItem.style.color = '#999';
            emptyItem.style.fontStyle = 'italic';
            quadrant.appendChild(emptyItem);
        }
    });
}

// AI 조언 기능 구현
async function generateAIAdvice(question) {
    const adviceElement = document.getElementById('aiAdvice');
    
    // 조언 요청 시작 메시지
    adviceElement.innerHTML = '<p>AI가 일정 분석 중입니다...</p>';
    
    try {
        // 데이터베이스에서 할일 목록 불러오기
        const snapshot = await database.ref('todos').once('value');
        const todos = [];
        snapshot.forEach(childSnapshot => {
            todos.push(childSnapshot.val());
        });
        
        // ChatGPT 조언 요청을 위한 프롬프트
        const prompt = `
내 일정 데이터: ${JSON.stringify(todos.slice(0, 10))}

당신은 일정 관리 전문가입니다. 위 데이터는 내 일정 목록의 일부입니다.
질문: ${question}

위 데이터에 기반해 일정 관리 조언을 해주세요. 
특히, 중요도와 반복성을 고려해서 다음 영역별로 조언해주세요:
1. 높은 중요도, 1회성 일정: 집중적으로 수행할 전략
2. 낮은 중요도, 1회성 일정: 위임하거나 최소화할 방법
3. 낮은 중요도, 반복적 일정: 자동화하거나 간소화할 방법
4. 높은 중요도, 반복적 일정: 루틴으로 확립할 방법
`;

        // ChatGPT API 호출 부분 (실제로는 서버에서 처리되어야 함)
        // 여기서는 API 대신 샘플 데이터를 반환
        
        // 샘플 AI 조언
        setTimeout(() => {
            const sampleAdvice = `
<strong>📊 일정 분석 결과</strong><br><br>

<strong>1. 집중 필요 영역 (높은 중요도, 1회성)</strong><br>
중요한 프레젠테이션이나 미팅과 같은 일정에는 집중력을 최대화하세요. 이런 일정 전에는 2시간 이상의 방해받지 않는 집중 시간을 확보하고, 알림을 끄세요. 포모도로 기법(25분 집중, 5분 휴식)을 활용하면 효과적입니다.<br><br>

<strong>2. 위임/거절 영역 (낮은 중요도, 1회성)</strong><br>
사무용품 구매나 간단한 자료 수집 같은 일은 가능하면 위임하거나 최소화하세요. "No"라고 말하는 연습을 하고, 꼭 필요한 일인지 재평가하세요.<br><br>

<strong>3. 자동화 영역 (낮은 중요도, 반복적)</strong><br>
주간 보고서 작성이나 데이터 업데이트 같은 반복 작업은 템플릿을 만들거나 자동화 도구를 활용하세요. 매번 같은 방식으로 처리하지 말고, 효율적인 시스템을 구축하세요.<br><br>

<strong>4. 루틴 확립 영역 (높은 중요도, 반복적)</strong><br>
팀 회의나 주요 프로젝트 검토와 같은 중요 반복 일정은 일정한 시간과 장소에 배정하고 철저히 준비하세요. 이런 활동은 성장에 중요하므로 최적의 시간대에 배치하는 것이 좋습니다.<br><br>

<strong>💡 종합 조언</strong><br>
일정을 더 효율적으로 관리하기 위해 매주 일요일이나 월요일 아침에 주간 계획을 세우고, 중요도와 반복성에 따라 적절한 전략을 적용해보세요. 특히 높은 중요도의 일정은 에너지가 높은 시간대에 배치하는 것이 효과적입니다.
`;
            adviceElement.innerHTML = sampleAdvice;
        }, 1500);
        
    } catch (error) {
        console.error('AI 조언 생성 오류:', error);
        adviceElement.innerHTML = '<p>조언 생성 중 오류가 발생했습니다. 다시 시도해주세요.</p>';
    }
}

// AI 조언 버튼 이벤트 리스너 추가
document.getElementById('getAdviceBtn').addEventListener('click', function() {
    const question = document.getElementById('adviceQuestion').value.trim();
    if (question) {
        generateAIAdvice(question);
    } else {
        alert('질문을 입력해주세요.');
    }
});

// 데이터 로딩 및 차트 생성 함수
function loadAndCreateCharts() {
    database.ref('todos').once('value')
        .then(snapshot => {
            // 스냅샷에서 할일 데이터 추출
            const todos = [];
            snapshot.forEach(childSnapshot => {
                todos.push(childSnapshot.val());
            });

            // 중요도 차트 생성
            createPriorityChart(todos);
            
            // 시간대별 차트 생성
            createTimeChart(todos);
            
            // 마감일 전 완료율 차트 생성
            createDeadlineCompletionChart(todos);
            
            // 트렌드 차트 생성
            createTrendChart(todos);
            
            // 매트릭스 차트 생성 (새로 추가)
            createMatrixChart(todos);
        })
        .catch(error => {
            console.error('데이터 로딩 오류:', error);
        });
}

// 페이지 로드 시 차트 생성
document.addEventListener('DOMContentLoaded', loadAndCreateCharts); 