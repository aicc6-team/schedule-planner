// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 구글 API 클라이언트 ID 및 API 키 설정
const GOOGLE_API_KEY = GOOGLE_CONFIG.API_KEY; // config.js에서 가져옴
const GOOGLE_CLIENT_ID = GOOGLE_CONFIG.CLIENT_ID; // config.js에서 가져옴
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

// 요소 참조 (필요한 경우에만 사용)
const calendarFrame = document.getElementById('calendarFrame');

// 페이지 로드 시 캘린더 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('캘린더 페이지 로드됨');
    initCalendar();
});

// 캘린더 iframe 업데이트
function updateCalendarIframe() {
    try {
        // config.js에 설정된 캘린더 ID를 사용하거나 기본값으로 primary 사용
        const calendarId = GOOGLE_CONFIG.CALENDAR_ID || 'primary';
        
        // 월간 뷰로 설정
        const calendarUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&showTitle=0&showNav=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0&mode=MONTH`;
        
        console.log('캘린더 URL 설정:', calendarUrl);
        
        // ID로 iframe 요소 선택
        if (calendarFrame) {
            calendarFrame.src = calendarUrl;
        } else {
            console.error('캘린더 iframe 요소를 찾을 수 없습니다');
        }
    } catch (error) {
        console.error('캘린더 iframe 업데이트 중 오류:', error);
    }
}

// 로컬 캘린더 초기화
function initCalendar() {
    console.log('캘린더 초기화 시작');
    updateCalendarIframe();
}

// 할일 데이터를 캘린더 이벤트로 변환
function convertTodosToEvents(todos) {
    if (!Array.isArray(todos) || todos.length === 0) {
        return [];
    }
    
    console.log('변환할 일정 데이터:', todos.length, '개');
    
    return todos.map(todo => {
        try {
            // date 필드 확인
            if (!todo.date) {
                console.warn('날짜 필드가 없는 할일 항목 무시:', todo);
                return null;
            }
            
            // title 또는 text 필드 사용 (일부 데이터는 text 필드 사용)
            const title = todo.title || todo.text || '';
            if (!title) {
                console.warn('제목 필드가 없는 할일 항목 무시:', todo);
                return null;
            }
            
            // time 필드가 없을 경우 기본값 설정
            const time = todo.time || '09:00';
            
            // 우선순위가 한글일 경우 영문으로 변환
            let priority = todo.priority;
            if (priority === '높음') priority = 'high';
            else if (priority === '보통' || priority === '중간') priority = 'medium';
            else if (priority === '낮음') priority = 'low';
            
            return {
                title: title,
                start: `${todo.date}T${time}`,
                end: calculateEndTime(todo.date, time, todo.duration),
                description: todo.description || '',
                color: getPriorityColor(priority)
            };
        } catch (error) {
            console.error('이벤트 변환 중 오류:', error, todo);
            return null;
        }
    }).filter(event => event !== null); // null 값 제거
}

// 종료 시간 계산
function calculateEndTime(date, startTime, duration) {
    try {
        // 타입 검사 및 기본값 설정
        if (typeof startTime !== 'string') {
            console.warn('startTime이 문자열이 아닙니다:', startTime);
            startTime = '09:00';
        }
        
        const timeArray = startTime.includes(':') ? startTime.split(':').map(Number) : [9, 0];
        const hours = timeArray[0] || 0;
        const minutes = timeArray[1] || 0;
        
        // duration이 숫자가 아니면 기본값 1 사용
        const durationHours = parseInt(duration) || 1;
        
        // 날짜 객체 생성 및 시간 설정
        const endTime = new Date(`${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
        endTime.setHours(endTime.getHours() + durationHours);
        
        return endTime.toISOString();
    } catch (error) {
        console.error('종료 시간 계산 중 오류:', error, { date, startTime, duration });
        // 기본값으로 시작 시간 + 1시간 반환
        const fallbackDate = new Date();
        fallbackDate.setHours(fallbackDate.getHours() + 1);
        return fallbackDate.toISOString();
    }
}

// 우선순위에 따른 색상 반환
function getPriorityColor(priority) {
    const colors = {
        high: '#e74c3c',
        medium: '#f1c40f',
        low: '#2ecc71',
        '높음': '#e74c3c',
        '보통': '#f1c40f',
        '중간': '#f1c40f',
        '낮음': '#2ecc71'
    };
    return colors[priority] || '#3498db';
}

// 구글 API 초기화
function initGoogleAPI() {
    // 필수 설정 값 확인
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
        console.error('구글 클라이언트 ID가 설정되지 않았습니다.');
        showStatus('구글 API 사용을 위해 config.js 파일에 클라이언트 ID를 설정해주세요.', 'error');
        return;
    }
    
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === '') {
        console.error('구글 API 키가 설정되지 않았습니다.');
        showStatus('구글 API 사용을 위해 config.js 파일에 API 키를 설정해주세요.', 'error');
        return;
    }

    gapi.load('client', async () => {
        try {
            await gapi.client.init({
                apiKey: GOOGLE_API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            });
            
            // 인증 버튼 준비
            authorizeButton.onclick = handleAuthClick;
            
            // 인증 상태 확인
            updateAuthStatus();
            
            // 토큰 클라이언트 초기화
            initTokenClient();
        } catch (error) {
            console.error('구글 API 초기화 오류:', error);
            showStatus('구글 API 초기화 중 오류가 발생했습니다. 개발자 콘솔을 확인해주세요.', 'error');
        }
    });
}

// 토큰 클라이언트 초기화
let tokenClient;
function initTokenClient() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                updateAuthStatus();
            }
        },
        ux_mode: 'popup',  // 팝업 모드 지정
        prompt: 'consent'  // 명시적 동의 필요
    });
}

// 인증 상태 업데이트
function updateAuthStatus() {
    const isAuthorized = gapi.client.getToken() !== null;
    if (isAuthorized) {
        authorizeButton.textContent = '구글 계정 연결됨';
        authorizeButton.disabled = true;
        exportButton.disabled = false;
        exportButton.onclick = exportToGoogleCalendar;
        showStatus('구글 계정이 연결되었습니다', 'success');
    } else {
        authorizeButton.textContent = '구글 계정 연결';
        authorizeButton.disabled = false;
        exportButton.disabled = true;
    }
}

// 인증 버튼 클릭 핸들러
function handleAuthClick() {
    showStatus('구글 계정 연결 중...', 'info');
    tokenClient.requestAccessToken();
}

// 파이어베이스 일정을 구글 캘린더로 내보내기
async function exportToGoogleCalendar() {
    if (!gapi.client.getToken()) {
        showStatus('구글 계정에 연결되어 있지 않습니다', 'error');
        return;
    }

    try {
        showStatus('일정 내보내기 중...', 'info');
        
        // 파이어베이스에서 할일 목록 가져오기
        const snapshot = await database.ref('todos').once('value');
        const todos = [];
        snapshot.forEach(childSnapshot => {
            const todo = childSnapshot.val();
            // completed가 true가 아닌 모든 할일을 포함
            if (todo && todo.completed !== true) {
                todos.push(todo);
            }
        });
        
        console.log(`내보낼 일정 데이터: ${todos.length}개`);
        
        if (todos.length === 0) {
            showStatus('내보낼 일정이 없습니다', 'info');
            return;
        }
        
        // 구글 캘린더에 이벤트 추가
        let successCount = 0;
        let errorCount = 0;
        
        // config.js에 설정된 캘린더 ID를 사용하거나 기본값으로 primary 사용
        const calendarId = GOOGLE_CONFIG.CALENDAR_ID || 'primary';
        
        for (const todo of todos) {
            try {
                // 필수 필드 확인
                if (!todo.date) {
                    console.warn('날짜 필드가 없어 건너뜀:', todo);
                    errorCount++;
                    continue;
                }
                
                // title 또는 text 필드 사용
                const summary = todo.title || todo.text || '제목 없음';
                
                // 날짜와 시간 계산
                const time = todo.time || '09:00';
                const startDateTime = `${todo.date}T${time}:00`;
                const endTime = new Date(`${todo.date}T${time}`);
                endTime.setHours(endTime.getHours() + parseInt(todo.duration || 1));
                const endDateTime = endTime.toISOString().replace('.000Z', '');
                
                // 우선순위 변환
                let priority = todo.priority;
                if (priority === '높음') priority = 'high';
                else if (priority === '보통' || priority === '중간') priority = 'medium';
                else if (priority === '낮음') priority = 'low';
                
                // 이벤트 생성
                const event = {
                    summary: summary,
                    description: todo.description || '',
                    start: {
                        dateTime: startDateTime,
                        timeZone: 'Asia/Seoul'
                    },
                    end: {
                        dateTime: endDateTime,
                        timeZone: 'Asia/Seoul'
                    },
                    colorId: getPriorityColorId(priority)
                };
                
                // 이벤트 추가
                await gapi.client.calendar.events.insert({
                    calendarId: calendarId,
                    resource: event
                });
                
                successCount++;
                console.log('일정 추가 성공:', summary);
            } catch (error) {
                console.error('이벤트 추가 오류:', error, todo);
                errorCount++;
            }
        }
        
        // 결과 표시
        if (errorCount === 0) {
            showStatus(`성공: ${successCount}개의 일정을 구글 캘린더에 저장했습니다`, 'success');
        } else {
            showStatus(`완료: ${successCount}개 성공, ${errorCount}개 실패`, 'info');
        }
        
    } catch (error) {
        console.error('구글 캘린더 내보내기 오류:', error);
        showStatus('일정 내보내기 중 오류가 발생했습니다', 'error');
    }
}

// 우선순위별 구글 캘린더 색상 ID 반환
function getPriorityColorId(priority) {
    // 구글 캘린더 색상 ID: https://developers.google.com/calendar/api/v3/reference/colors/get
    const colorIds = {
        high: '11',    // 빨간색
        medium: '5',   // 노란색
        low: '10',     // 초록색
        '높음': '11',   // 빨간색
        '보통': '5',    // 노란색
        '중간': '5',    // 노란색
        '낮음': '10'    // 초록색
    };
    return colorIds[priority] || '1'; // 기본은 파란색
}

// 상태 메시지 표시
function showStatus(message, type = 'info') {
    calendarStatus.textContent = message;
    calendarStatus.className = 'status-message ' + type;
} 