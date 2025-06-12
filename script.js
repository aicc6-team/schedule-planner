/*
 * 할일 관리 애플리케이션
 * 
 * 주요 기능:
 * 1. 할일 추가, 수정, 삭제, 완료 처리
 * 2. 날짜별/중요도별 정렬
 * 3. 할일 분석 및 시각화
 * 4. AI 기반 일정 추천
 */

// 할일 목록 저장할 배열 (현재는 Firebase 사용으로 직접 사용하진 않음)
let todos = [];  // 할일 객체들이 담기는 배열

// === HTML 요소 가져오기 ===
const todoInput = document.getElementById('todoInput'); // 입력창 (할일 내용)
const todoDescription = document.getElementById('todoDescription'); // 입력창 (할일 설명)
const todoDate = document.getElementById('todoDate'); // 입력창 (날짜)
const todoTime = document.getElementById('todoTime'); // 입력창 (소요시간)
const todoDuration = document.getElementById('todoDuration'); // 입력창 (소요시간)
const todoPriority = document.getElementById('todoPriority'); // 입력창 (중요도 선택)
const addButton = document.getElementById('addButton'); // 추가 버튼
const todoList = document.getElementById('todoList'); // 할일 목록 표시 영역
const aiAdviceElement = document.getElementById('aiAdvice'); // AI 조언 표시 영역
const tabButtons = document.querySelectorAll('.tab-button');

// === 차트 객체 (나중에 차트.js에서 쓰기 위해 전역 변수로 선언) ===
let priorityChart = null; // 중요도 차트
let timeChart = null; // 소요시간 차트

// === Firebase 초기화 ===
// 참고: firebaseConfig는 config.js에서 가져옵니다
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 현재 선택된 탭 (현재 할일 or 완료된 할일)
let activeTab = 'current';

// 현재 정렬 방식 (날짜순 or 중요도순)
let sortBy = 'date';

// 오늘 날짜를 기본값으로 설정
const today = new Date().toISOString().split('T')[0];
todoDate.value = today;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log('페이지 로드됨');
    
    // Firebase 데이터 연결 상태 확인
    database.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true) {
            console.log('Firebase에 연결됨');
        } else {
            console.log('Firebase에 연결되지 않음');
        }
    });
    
    // 데이터 로드
    loadTodos();
    
    // 추가 버튼 이벤트 리스너
    addButton.addEventListener('click', addOrUpdateTodo);
    
    // 탭 버튼 이벤트 리스너
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeTab = button.dataset.tab;
            loadTodos();
        });
    });
    
    // 정렬 버튼 이벤트 리스너 (동적 생성 버튼)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('sort-button')) {
            sortBy = e.target.dataset.sort;
            document.querySelectorAll('.sort-button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            loadTodos();
        }
    });
    
    // 구글 계정 연결 버튼 이벤트 리스너
    const authorizeButton = document.getElementById('authorizeButton');
    if (authorizeButton) {
        // 초기화된 API가 없으므로 클릭 시 초기화 실행
        authorizeButton.addEventListener('click', initGoogleAPI);
    }
    
    // 분석 버튼 이벤트 리스너 설정
    setupAnalyzeButton();
    
    // 구글 API 자동 초기화 시도
    initGoogleAPI();
});

// 할일 추가 또는 수정 함수
function addOrUpdateTodo() {
    // 입력값 가져오기
    const title = todoInput.value.trim();
    const description = todoDescription.value.trim();
    const date = todoDate.value;
    const time = todoTime.value;
    const duration = todoDuration.value;
    const priority = todoPriority.value;
    
    // 필수 입력값 확인
    if (!title) {
        alert('할일을 입력해주세요');
        return;
    }
    
    if (!date) {
        alert('날짜를 선택해주세요');
        return;
    }
    
    // 수정 모드인지 확인
    const editId = addButton.dataset.editId;
    
    if (editId) {
        // 할일 수정
        database.ref(`todos/${editId}`).update({
            title,
            description,
            date,
            time,
            duration: duration || '0.5',
            priority,
            updatedAt: Date.now()
        })
        .then(() => {
            console.log('할일이 성공적으로 수정됨:', editId);
            resetForm();
            loadTodos();
        })
        .catch(error => {
            console.error('할일 수정 중 오류 발생:', error);
            alert('할일을 수정하지 못했습니다.');
        });
    } else {
        // 새 할일 추가
        const newTodo = {
            title,
            description,
            date,
            time,
            duration: duration || '0.5',
            priority,
            completed: false,
            createdAt: Date.now()
        };
        
        console.log('새 할일 추가 중:', newTodo);
        
        database.ref('todos').push(newTodo)
            .then((ref) => {
                console.log('할일이 성공적으로 추가됨:', ref.key);
                resetForm();
                loadTodos();
            })
            .catch(error => {
                console.error('할일 추가 중 오류 발생:', error);
                alert('할일을 추가하지 못했습니다.');
            });
    }
}

// 폼 초기화
function resetForm() {
    todoInput.value = '';
    todoDescription.value = '';
    todoDate.value = today;
    todoTime.value = '09:00';
    todoDuration.value = '0.5'; // 기본값 30분으로 수정
    todoPriority.value = 'low';
    
    // 수정 모드 종료
    addButton.textContent = '추가';
    delete addButton.dataset.editId;
}

// 할일 목록 로드
function loadTodos() {
    console.log('할일 목록 로드 중...');
    database.ref('todos').once('value')
        .then((snapshot) => {
            console.log('Firebase에서 데이터 수신됨');
            const todos = snapshot.val();
            console.log('받은 데이터:', todos);
            
            if (!todos) {
                console.log('데이터가 없음');
                todoList.innerHTML = '<p class="empty-list">할일이 없습니다. 새로운 할일을 추가해보세요!</p>';
                return;
            }
            
            renderTodos(todos);
        })
        .catch(error => {
            console.error('할일 목록 로드 중 오류 발생:', error);
            todoList.innerHTML = '<p class="error">할일 목록을 불러오지 못했습니다.</p>';
        });
}

// 할일 목록 렌더링
function renderTodos(todos) {
    console.log('할일 목록 렌더링 시작');
    todoList.innerHTML = '';
    
    // 정렬 버튼과 총 개수 표시를 위한 컨테이너 생성
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'todo-controls';
    
    // 정렬 버튼 영역 생성
    const sortButtons = document.createElement('div');
    sortButtons.className = 'sort-buttons';
    sortButtons.innerHTML = `
        <button class="sort-button ${sortBy === 'date' ? 'active' : ''}" data-sort="date">날짜순</button>
        <button class="sort-button ${sortBy === 'priority' ? 'active' : ''}" data-sort="priority">중요도순</button>
    `;
    
    // 할일 정렬
    let sortedTodos = [];
    try {
        sortedTodos = Object.entries(todos).sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(a[1].date) - new Date(b[1].date);
            } else {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
            }
        });
        
        console.log('정렬된 할일:', sortedTodos.length);
    } catch (error) {
        console.error('할일 정렬 중 오류:', error);
        sortedTodos = Object.entries(todos);
    }
    
    // 현재 날짜
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // 탭에 따라 필터링
    const filteredTodos = sortedTodos.filter(([_, todo]) => {
        try {
            // 날짜 변환
            const todoDate = new Date(todo.date);
            todoDate.setHours(0, 0, 0, 0);
            
            if (activeTab === 'current') {
                return !todo.completed && todoDate >= currentDate;
            } else {
                return todo.completed || todoDate < currentDate;
            }
        } catch (error) {
            console.error('할일 필터링 중 오류:', error, todo);
            return false;
        }
    });
    
    console.log('필터링된 할일:', filteredTodos.length);
    
    // 총 개수 표시
    const totalCount = document.createElement('div');
    totalCount.className = 'total-count';
    totalCount.textContent = `총 ${filteredTodos.length}개의 할일`;
    
    // 정렬 버튼과 총 개수를 같은 줄에 배치
    controlsContainer.appendChild(sortButtons);
    controlsContainer.appendChild(totalCount);
    todoList.appendChild(controlsContainer);
    
    // 할일이 없을 경우
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-list';
        emptyMessage.textContent = activeTab === 'current' ? '현재 할일이 없습니다.' : '완료된 할일이 없습니다.';
        todoList.appendChild(emptyMessage);
    } else {
        // 할일 목록 생성
        filteredTodos.forEach(([key, todo]) => {
            displayTodoItem(todo, key);
        });
    }
    
    // AI 조언 업데이트 - 자동 분석하지 않고 버튼 준비만 함
    updateAIAdvice(todos);
}

// 할일 항목 표시
function displayTodoItem(todo, key) {
    try {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item priority-${todo.priority}`;
        
        // 중요도에 따른 배경색 설정
        const priorityColors = {
            'high': '#ffebee',
            'medium': '#fffde7',
            'low': '#e8f5e9'
        };
        
        // 배경색 적용
        todoItem.style.backgroundColor = priorityColors[todo.priority] || '#ffffff';
        
        // 날짜 포맷팅
        const date = new Date(todo.date);
        const options = { month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('ko-KR', options);
        
        // 시간 및 소요시간 포맷팅
        let timeString = '';
        if (todo.time) {
            let durationText = '';
            if (todo.duration) {
                // 소요시간 포맷팅 (1.5 -> 1시간 30분)
                const durationVal = parseFloat(todo.duration);
                if (durationVal % 1 === 0) {
                    durationText = `${durationVal}시간`;
                } else {
                    const hours = Math.floor(durationVal);
                    const minutes = (durationVal % 1) * 60;
                    if (hours > 0) {
                        durationText = `${hours}시간 ${minutes}분`;
                    } else {
                        durationText = `${minutes}분`;
                    }
                }
            }
            timeString = `${todo.time} (${durationText})`;
        }
        
        // 제목이 text인지 title인지 확인
        const todoTitle = todo.title || todo.text || '제목 없음';
        
        todoItem.innerHTML = `
            <div class="todo-item-content">
                <div class="todo-item-title">${todoTitle}</div>
                ${todo.description ? `<div class="todo-item-description">${todo.description}</div>` : '<div class="todo-item-description"></div>'}
                <div class="todo-item-details">
                    <span>${formattedDate}</span>
                    ${timeString ? `<span> | ${timeString}</span>` : ''}
                    <span> | ${getPriorityText(todo.priority)}</span>
                </div>
            </div>
            <div class="todo-item-buttons">
                ${!todo.completed ? 
                    `<button class="todo-complete-btn" data-id="${key}" title="완료"><i class="fas fa-check"></i></button>` : 
                    `<button class="todo-complete-btn" data-id="${key}" style="background-color: #95a5a6;" title="취소"><i class="fas fa-undo"></i></button>`
                }
                <button class="todo-edit-btn" data-id="${key}" title="수정"><i class="fas fa-edit"></i></button>
                <button class="todo-delete-btn" data-id="${key}" title="삭제"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        // 버튼 이벤트 연결
        const completeBtn = todoItem.querySelector('.todo-complete-btn');
        completeBtn.addEventListener('click', () => {
            toggleTodoComplete(key, !todo.completed);
        });
        
        const editBtn = todoItem.querySelector('.todo-edit-btn');
        editBtn.addEventListener('click', () => {
            editTodo(todo, key);
        });
        
        const deleteBtn = todoItem.querySelector('.todo-delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteTodo(key);
        });
        
        todoList.appendChild(todoItem);
    } catch (error) {
        console.error('할일 항목 표시 중 오류:', error, todo);
    }
}

// 중요도 텍스트 반환
function getPriorityText(priority) {
    switch(priority) {
        case 'high': return '높음';
        case 'medium': return '중간';
        case 'low': return '낮음';
        default: return '낮음';
    }
}

// 할일 완료 상태 토글
function toggleTodoComplete(id, isComplete) {
    console.log('할일 상태 변경:', id, isComplete);
    database.ref(`todos/${id}`).update({ 
        completed: isComplete,
        updatedAt: Date.now()
    })
    .then(() => {
        console.log('할일 상태가 변경됨');
        loadTodos();
    })
    .catch(error => {
        console.error('할일 상태 변경 중 오류 발생:', error);
        alert('할일 상태를 변경하지 못했습니다.');
    });
}

// 할일 수정
function editTodo(todo, key) {
    console.log('할일 수정 시작:', key, todo);
    
    // 제목이 text인지 title인지 확인
    const todoTitle = todo.title || todo.text || '';
    
    todoInput.value = todoTitle;
    todoDescription.value = todo.description || '';
    todoDate.value = todo.date;
    todoTime.value = todo.time || '09:00';
    
    // 소요시간 설정 (빈 값이면 기본값 '0.5'로 설정)
    if (todo.duration) {
        todoDuration.value = todo.duration;
    } else {
        todoDuration.value = '0.5';
    }
    
    // 기존 소요시간 값이 선택 옵션에 없는 경우를 처리
    const durationOptions = Array.from(todoDuration.options).map(opt => opt.value);
    if (!durationOptions.includes(todo.duration)) {
        // 가장 가까운 옵션 선택
        const durationValue = parseFloat(todo.duration || '0.5');
        const closestOption = durationOptions.reduce((prev, curr) => {
            return Math.abs(parseFloat(curr) - durationValue) < Math.abs(parseFloat(prev) - durationValue) 
                ? curr : prev;
        });
        todoDuration.value = closestOption;
    }
    
    todoPriority.value = todo.priority;
    
    addButton.textContent = '수정';
    addButton.dataset.editId = key;
    
    // 스크롤 맨 위로 이동
    window.scrollTo(0, 0);
}

// 할일 삭제
function deleteTodo(id) {
    if (confirm('정말 삭제하시겠습니까?')) {
        console.log('할일 삭제:', id);
        database.ref(`todos/${id}`).remove()
            .then(() => {
                console.log('할일이 삭제됨');
                loadTodos();
            })
            .catch(error => {
                console.error('할일 삭제 중 오류 발생:', error);
                alert('할일을 삭제하지 못했습니다.');
            });
    }
}

// AI 조언 업데이트
function updateAIAdvice(todos) {
    try {
        // 분석 버튼 설정
        setupAnalyzeButton(todos);
    } catch (error) {
        console.error('AI 조언 초기화 중 오류 발생:', error);
        aiAdviceElement.innerHTML = `
            <div class="advice-item">
                <h4>⚠️ 오류 발생</h4>
                <p>AI 분석 기능을 초기화하는 중 오류가 발생했습니다.</p>
            </div>
        `;
    }
}

// 분석 버튼 설정 함수
function setupAnalyzeButton(todos) {
    const analyzeButton = document.getElementById('analyzeButton');
    const aiAdviceContent = document.getElementById('aiAdviceContent');
    
    if (!analyzeButton) return;
    
    // 기존 이벤트 리스너 제거
    analyzeButton.replaceWith(analyzeButton.cloneNode(true));
    
    // 새 참조 가져오기
    const newAnalyzeButton = document.getElementById('analyzeButton');
    
    newAnalyzeButton.addEventListener('click', async () => {
        newAnalyzeButton.disabled = true;
        newAnalyzeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 분석 및 동기화 중...';
        aiAdviceContent.style.display = 'block';
        
        try {
            // 최신 할일 데이터 가져오기
            const snapshot = await database.ref('todos').once('value');
            const latestTodos = snapshot.val() || {};
            
            // 1. 일정 데이터 분석
            const analysisResult = await performAIAnalysis(latestTodos);
            
            // 구글 API 인증 상태 확인
            const isAuthorized = gapi.client && gapi.client.getToken() !== null;
            
            // 2. 분석 결과에 따라 구글 캘린더에 일정 동기화
            if (isAuthorized && newAnalyzeButton.dataset.synced !== 'true') {
                try {
                    const syncResult = await syncWithGoogleCalendar(latestTodos, analysisResult);
                    newAnalyzeButton.dataset.synced = 'true';
                    // 동기화 성공 메시지 표시
                    const syncMessage = document.createElement('div');
                    syncMessage.className = 'sync-message success';
                    syncMessage.innerHTML = `
                        <i class="fas fa-check-circle"></i> 
                        <span>${syncResult}</span>
                    `;
                    aiAdviceContent.insertBefore(syncMessage, aiAdviceContent.firstChild);
                } catch (syncError) {
                    console.error('구글 캘린더 동기화 오류:', syncError);
                    // 동기화 실패 메시지 표시
                    const syncMessage = document.createElement('div');
                    syncMessage.className = 'sync-message error';
                    syncMessage.innerHTML = `
                        <i class="fas fa-exclamation-circle"></i> 
                        <span>구글 캘린더 동기화 중 오류가 발생했습니다: ${syncError.message}</span>
                    `;
                    aiAdviceContent.insertBefore(syncMessage, aiAdviceContent.firstChild);
                }
            } else if (!isAuthorized) {
                // 인증되지 않은 경우 안내 메시지
                const syncMessage = document.createElement('div');
                syncMessage.className = 'sync-message info';
                syncMessage.innerHTML = `
                    <i class="fas fa-info-circle"></i> 
                    <span>구글 계정을 연결하면 일정을 구글 캘린더에 동기화할 수 있습니다.</span>
                `;
                aiAdviceContent.insertBefore(syncMessage, aiAdviceContent.firstChild);
            }
            
            newAnalyzeButton.disabled = false;
            newAnalyzeButton.innerHTML = '<i class="fas fa-magic"></i> AI로 일정 다시 분석하기';
        } catch (error) {
            newAnalyzeButton.disabled = false;
            newAnalyzeButton.innerHTML = '<i class="fas fa-magic"></i> 다시 시도하기';
            console.error('AI 조언 생성 실패:', error);
            
            // 오류 메시지 표시
            aiAdviceContent.innerHTML = `
                <div class="advice-item">
                    <h4><i class="fas fa-exclamation-triangle"></i> 오류 발생</h4>
                    <p>일정 분석 중 오류가 발생했습니다: ${error.message}</p>
                    <p>다시 시도해주세요.</p>
                </div>
            `;
        }
    });
}

// 구글 API 초기화
function initGoogleAPI() {
    console.log('구글 API 초기화 시작');
    const calendarStatus = document.getElementById('calendarStatus');
    const authorizeButton = document.getElementById('authorizeButton');
    
    // 상태 메시지 표시
    if (calendarStatus) {
        calendarStatus.textContent = "구글 API 초기화 중...";
        calendarStatus.className = "status-message info";
    }
    
    // 필수 설정 값 확인
    if (!GOOGLE_CONFIG.CLIENT_ID || GOOGLE_CONFIG.CLIENT_ID === '') {
        console.error('구글 클라이언트 ID가 설정되지 않았습니다.');
        if (calendarStatus) {
            calendarStatus.textContent = "구글 API 사용을 위해 config.js 파일에 클라이언트 ID를 설정해주세요.";
            calendarStatus.className = "status-message error";
        }
        return;
    }
    
    if (!GOOGLE_CONFIG.API_KEY || GOOGLE_CONFIG.API_KEY === '') {
        console.error('구글 API 키가 설정되지 않았습니다.');
        if (calendarStatus) {
            calendarStatus.textContent = "구글 API 사용을 위해 config.js 파일에 API 키를 설정해주세요.";
            calendarStatus.className = "status-message error";
        }
        return;
    }

    gapi.load('client', async () => {
        try {
            await gapi.client.init({
                apiKey: GOOGLE_CONFIG.API_KEY,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            });
            
            // 구글 캘린더 API 초기화
            await gapi.client.load('calendar', 'v3');
            console.log('구글 캘린더 API 로드 완료');
            
            // 토큰 클라이언트 초기화
            initTokenClient();
            
            if (calendarStatus) {
                calendarStatus.textContent = "구글 API 초기화 완료. 계정 인증을 진행하세요.";
                calendarStatus.className = "status-message success";
            }
            
            // 인증 버튼 상태 업데이트 - 직접 handleAuthClick 핸들러 할당
            if (authorizeButton) {
                authorizeButton.onclick = handleAuthClick;
                authorizeButton.textContent = '구글 계정 연결';
                authorizeButton.disabled = false;
            }
        } catch (error) {
            console.error('구글 API 초기화 오류:', error);
            if (calendarStatus) {
                calendarStatus.textContent = "구글 API 초기화 중 오류가 발생했습니다.";
                calendarStatus.className = "status-message error";
            }
        }
    });
}

// 토큰 클라이언트 초기화
let tokenClient;
function initTokenClient() {
    console.log('토큰 클라이언트 초기화 시작');
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/calendar',
            callback: (tokenResponse) => {
                console.log('토큰 응답 수신:', tokenResponse ? '성공' : '실패');
                if (tokenResponse && tokenResponse.access_token) {
                    console.log('유효한 액세스 토큰 수신, 인증 상태 업데이트');
                    updateAuthStatus();
                }
            },
            ux_mode: 'popup',  // 팝업 모드 지정
            prompt: 'consent', // 명시적 동의 필요
            error_callback: (error) => {
                console.error('OAuth 오류:', error);
                const calendarStatus = document.getElementById('calendarStatus');
                if (calendarStatus) {
                    calendarStatus.textContent = `인증 오류: ${error.type}`;
                    calendarStatus.className = "status-message error";
                }
            }
        });
        console.log('토큰 클라이언트 초기화 완료');
    } catch (error) {
        console.error('토큰 클라이언트 초기화 오류:', error);
    }
}

// 인증 상태 업데이트
function updateAuthStatus() {
    console.log('인증 상태 업데이트 시작');
    const authorizeButton = document.getElementById('authorizeButton');
    const calendarStatus = document.getElementById('calendarStatus');
    const analyzeButton = document.getElementById('analyzeButton');
    
    const token = gapi.client.getToken();
    const isAuthorized = token !== null;
    console.log('인증 상태:', isAuthorized ? '인증됨' : '인증되지 않음');
    
    if (isAuthorized) {
        if (authorizeButton) {
            authorizeButton.textContent = '구글 계정 연결됨';
            authorizeButton.disabled = true;
        }
        
        if (calendarStatus) {
            calendarStatus.textContent = "구글 계정이 연결되었습니다. AI 분석 후 캘린더 동기화가 가능합니다.";
            calendarStatus.className = "status-message success";
        }
        
        if (analyzeButton) {
            analyzeButton.disabled = false;
        }
    } else {
        if (authorizeButton) {
            authorizeButton.textContent = '구글 계정 연결';
            authorizeButton.disabled = false;
        }
        
        if (calendarStatus) {
            calendarStatus.textContent = "구글 계정 연결이 필요합니다.";
            calendarStatus.className = "status-message info";
        }
    }
}

// 인증 버튼 클릭 핸들러
function handleAuthClick() {
    console.log('인증 버튼 클릭 처리 시작');
    const calendarStatus = document.getElementById('calendarStatus');
    
    if (calendarStatus) {
        calendarStatus.textContent = "구글 계정 연결 중...";
        calendarStatus.className = "status-message info";
    }
    
    if (!tokenClient) {
        console.error('토큰 클라이언트가 초기화되지 않았습니다.');
        if (calendarStatus) {
            calendarStatus.textContent = "구글 API가 올바르게 초기화되지 않았습니다. 페이지를 새로고침하세요.";
            calendarStatus.className = "status-message error";
        }
        return;
    }
    
    try {
        console.log('액세스 토큰 요청 시작');
        tokenClient.requestAccessToken();
        console.log('액세스 토큰 요청 완료');
    } catch (error) {
        console.error('구글 인증 중 오류 발생:', error);
        if (calendarStatus) {
            calendarStatus.textContent = `구글 인증 중 오류: ${error.message}`;
            calendarStatus.className = "status-message error";
        }
    }
}

// AI 분석 수행 함수 (실제 API 호출 및 결과 처리)
async function performAIAnalysis(todos) {
    // 현재 날짜 및 할일 분석
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 오늘부터 5일간의 날짜 생성
    const next5Days = [];
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        next5Days.push(date.toISOString().split('T')[0]);
    }
    
    // 미완료 할일만 추출하고 날짜순 정렬
    const pendingTodos = Object.entries(todos)
        .filter(([_, todo]) => !todo.completed)
        .map(([key, todo]) => {
            // 제목이 text인지 title인지 확인
            const todoTitle = todo.title || todo.text || '제목 없음';
            return {
                ...todo, 
                id: key,
                title: todoTitle
            };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log('미완료 할일:', pendingTodos.length);
    
    // 날짜별 할일 그룹화
    const dateGroups = {};
    
    // 먼저 다음 5일에 대한 빈 배열 생성
    next5Days.forEach(date => {
        dateGroups[date] = [];
    });
    
    // 할일 그룹화
    pendingTodos.forEach(todo => {
        if (dateGroups[todo.date] !== undefined) {
            dateGroups[todo.date].push(todo);
        }
    });
    
    // API 요청 준비
    const loadingElement = document.getElementById('aiAdviceContent');
    loadingElement.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> AI가 일정을 분석 중입니다...</div>';
    
    // OpenAI API에 전송할 요청
    try {
        if (!CONFIG.OPENAI_API_KEY) {
            throw new Error('OpenAI API 키가 설정되지 않았습니다. config.js 파일을 확인해주세요.');
        }
        
        // 날짜 데이터를 API 요청에 맞게 준비
        const datesData = next5Days.map(date => {
            return {
                date: date,
                todos: dateGroups[date].map(todo => ({
                    title: todo.title,
                    description: todo.description || '',
                    time: todo.time || '',
                    duration: todo.duration || '0.5',
                    priority: todo.priority
                }))
            };
        });
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "당신은 일정 관리 전문가입니다. 사용자의 할일 목록을 분석하고 향후 5일간의 일정을 시간별로 정리하여 조언해주세요. 일정이 겹치는 경우 중요도와 소요시간을 고려하여 최적의 시간 배치를 제안해주세요. 일정 충돌이 있는 경우 해당 정보를 반환해주세요. 단, 두 일정 사이에 30분 이상의 여유 시간이 있으면 충돌로 간주하지 마세요. 개인 일정인지 단체 일정인지 구분해서 중요도에 따라 일정을 조정해주세요."
                    },
                    {
                        role: "user",
                        content: `다음은 사용자의 향후 5일간 할일 목록입니다. 각 날짜별 일정을 분석해주세요.
                        
                        ${JSON.stringify(datesData, null, 2)}
                        
                        다음과 같은 형식으로 응답해주세요:
                        {
                            "schedule": {
                                "days": [
                                    {
                                        "date": "${next5Days[0]}",
                                        "morning": ["오전에 할 일들 (시간대별로)"],
                                        "afternoon": ["오후에 할 일들 (시간대별로)"],
                                        "evening": ["저녁에 할 일들 (시간대별로)"],
                                        "conflicts": ["일정 충돌이 있는 일정들"],
                                        "adjustments": ["조정된 일정들"]
                                    },
                                    {
                                        "date": "${next5Days[1]}",
                                        "morning": ["오전에 할 일들 (시간대별로)"],
                                        "afternoon": ["오후에 할 일들 (시간대별로)"],
                                        "evening": ["저녁에 할 일들 (시간대별로)"],
                                        "conflicts": ["일정 충돌이 있는 일정들"],
                                        "adjustments": ["조정된 일정들"]
                                    },
                                    ...나머지 날짜들(필수)
                                ]
                            },
                            "conflicts": "일정 충돌이 있다면 여기에 설명해주세요. 단, 두 일정 사이에 30분 이상의 여유 시간이 있으면 충돌로 간주하지 마세요.",
                            "advice": "효율적인 일정 관리를 위한 조언을 여기에 작성해주세요. 개인 일정인지 단체 일정인지 구분하여 중요도에 따라 일정을 조정해주세요."
                        }
                        
                        반드시 5일치 모든 날짜를 포함해야 합니다. 일정이 없는 날짜도 포함하세요.`
                    }
                ]
            })
        });
        
        // 응답 처리
        const result = await response.json();
        
        if (!result.choices || result.choices.length === 0) {
            throw new Error('API 응답에 유효한 데이터가 없습니다.');
        }
        
        const content = result.choices[0].message.content;
        let advice = null;
        
        try {
            advice = JSON.parse(content);
        } catch (error) {
            console.error('JSON 파싱 오류:', error);
            // JSON 파싱 실패 시 텍스트 형식으로 표시
            document.getElementById('aiAdviceContent').innerHTML = `
                <div class="advice-item">
                    <h4>📅 AI 분석 결과</h4>
                    <p style="white-space: pre-wrap;">${content}</p>
                </div>
            `;
            return null;
        }
        
        console.log('AI 분석 결과:', advice);
        
        // 일정 조언 HTML 생성 - 시각적으로 개선된 버전
        let scheduleHTML = `
            <div class="schedule-container">
                <h3>📊 일정 시각화</h3>
                <div class="schedule-legend">
                    <div class="legend-item"><span class="legend-dot conflict"></span> 일정 충돌</div>
                    <div class="legend-item"><span class="legend-dot adjusted"></span> 조정된 일정</div>
                    <div class="legend-item"><span class="legend-dot high"></span> 높은 중요도</div>
                    <div class="legend-item"><span class="legend-dot medium"></span> 중간 중요도</div>
                    <div class="legend-item"><span class="legend-dot low"></span> 낮은 중요도</div>
                </div>
                <div class="schedule-grid">
        `;
        
        // 5일간의 일정 모두 표시
        if (advice.schedule && advice.schedule.days) {
            // 모든 날짜 표시
            advice.schedule.days.forEach(day => {
                scheduleHTML += `
                    <div class="schedule-section">
                        <h4><i class="fas fa-calendar-day"></i> ${formatDate(day.date)}</h4>
                        <div class="timeline-container">
                            ${generateTimeline(
                                day.morning || [], 
                                day.afternoon || [], 
                                day.evening || [], 
                                day.conflicts || [], 
                                day.adjustments || []
                            )}
                        </div>
                    </div>
                `;
            });
        }
        
        scheduleHTML += `</div>`;
        
        // 충돌 및 조언 추가
        let adviceHTML = `
            <div class="advice-grid">
                ${advice.conflicts ? `
                <div class="advice-item">
                    <h4><i class="fas fa-exclamation-triangle"></i> 일정 충돌 분석</h4>
                    <p>${advice.conflicts}</p>
                </div>
                ` : ''}
                <div class="advice-item">
                    <h4><i class="fas fa-lightbulb"></i> 일정 관리 조언</h4>
                    <p>${advice.advice}</p>
                </div>
            </div>
        `;
        
        // AI 조언 표시
        document.getElementById('aiAdviceContent').innerHTML = scheduleHTML + adviceHTML;
        
        return advice;
    } catch (error) {
        console.error('AI 분석 실패:', error);
        document.getElementById('aiAdviceContent').innerHTML = `
            <div class="advice-item">
                <h4>⚠️ 오류 발생</h4>
                <p>AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.</p>
            </div>
        `;
        return null;
    }
}

// 타임라인 생성 함수 (새로 추가)
function generateTimeline(morningTasks, afternoonTasks, eveningTasks, conflictTasks = [], adjustedTasks = []) {
    // 각 시간대별 색상
    const colors = {
        morning: {
            bg: '#e3f2fd',
            border: '#bbdefb',
            icon: '🌅'
        },
        afternoon: {
            bg: '#fff8e1',
            border: '#ffecb3',
            icon: '☀️'
        },
        evening: {
            bg: '#e8eaf6',
            border: '#c5cae9',
            icon: '🌙'
        },
        priority: {
            high: '#ffebee', // 높은 중요도 배경색
            medium: '#fffde7', // 중간 중요도 배경색
            low: '#e8f5e9' // 낮은 중요도 배경색
        },
        priorityBorder: {
            high: '#e74c3c', // 높은 중요도 테두리색
            medium: '#f1c40f', // 중간 중요도 테두리색
            low: '#2ecc71' // 낮은 중요도 테두리색
        }
    };
    
    // 우선순위 텍스트 처리
    function parsePriority(taskText) {
        let priority = 'low'; // 기본값
        
        if (taskText.includes('중요도: 높음') || taskText.includes('우선순위: 높음') || 
            taskText.toLowerCase().includes('high')) {
            priority = 'high';
        } else if (taskText.includes('중요도: 중간') || taskText.includes('우선순위: 중간') || 
                  taskText.toLowerCase().includes('medium')) {
            priority = 'medium';
        }
        
        return priority;
    }
    
    // 작업 시간과 내용 분리 (개선된 버전)
    function parseTaskInfo(taskText) {
        // 정규식으로 시간 형식 추출 - 더 유연한 패턴으로 개선
        const timeRegex = /^(\d{1,2}:\d{2})\s+(.*?)(?:\s*\(([^)]+)\))?$/;
        const match = taskText.match(timeRegex);
        
        if (match) {
            return {
                time: match[1] || '',
                title: match[2] ? match[2].trim() : '제목 추출 실패', // 제목이 빈 문자열이면 '제목 추출 실패' 표시
                duration: match[3] ? `(${match[3]})` : ''
            };
        }
        
        // 시간 패턴이 없거나 정규식이 매치되지 않는 경우 대체 정규식 시도
        const alternativeRegex = /(\d{1,2}:\d{2})(?:.*?)([^(]+)(?:\(([^)]+)\))?/;
        const altMatch = taskText.match(alternativeRegex);
        
        if (altMatch) {
            return {
                time: altMatch[1] || '',
                title: altMatch[2] ? altMatch[2].trim() : '제목 추출 실패',
                duration: altMatch[3] ? `(${altMatch[3]})` : ''
            };
        }
        
        // 모든 정규식이 실패할 경우, 전체 텍스트를 제목으로 처리
        console.log('정규식 매치 실패, 전체 텍스트 사용:', taskText);
        return {
            time: '',
            title: taskText.trim() || '제목 없음', // 빈 문자열이면 '제목 없음' 표시
            duration: ''
        };
    }

    // 충돌/조정 필요 일정 확인
    function checkTaskStatus(task) {
        // 문자열이 배열에 있는지 체크하는 함수
        const containsTask = (arr, task) => {
            return arr.some(item => task.includes(item) || item.includes(task));
        };
        
        if (containsTask(conflictTasks, task)) {
            return 'conflict';
        } else if (containsTask(adjustedTasks, task)) {
            return 'adjusted';
        }
        return '';
    }
    
    // 타임라인 HTML 생성
    let timelineHTML = `
        <div class="timeline">
            <div class="time-block" style="background-color: ${colors.morning.bg}; border-left: 3px solid ${colors.morning.border}">
                <div class="time-header">
                    ${colors.morning.icon} 오전
                </div>
                <div class="task-list">
                    ${morningTasks.length > 0 ? 
                        morningTasks.map(task => {
                            const priority = parsePriority(task);
                            const taskInfo = parseTaskInfo(task);
                            const taskStatus = checkTaskStatus(task);
                            
                            return `
                                <div class="task-item ${taskStatus}" style="background-color: ${colors.priority[priority]}; border-left: 3px solid ${colors.priorityBorder[priority]}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div class="task-dot" style="background-color: ${colors.priorityBorder[priority]}"></div>
                                    <div class="task-time">${taskInfo.time}</div>
                                    <div class="task-content">${taskInfo.title}</div>
                                    <div class="task-duration">${taskInfo.duration}</div>
                                </div>
                            `;
                        }).join('') : 
                        '<div class="empty-tasks">예정된 일정이 없습니다</div>'
                    }
                </div>
            </div>
            
            <div class="time-block" style="background-color: ${colors.afternoon.bg}; border-left: 3px solid ${colors.afternoon.border}">
                <div class="time-header">
                    ${colors.afternoon.icon} 오후
                </div>
                <div class="task-list">
                    ${afternoonTasks.length > 0 ? 
                        afternoonTasks.map(task => {
                            const priority = parsePriority(task);
                            const taskInfo = parseTaskInfo(task);
                            const taskStatus = checkTaskStatus(task);
                            
                            return `
                                <div class="task-item ${taskStatus}" style="background-color: ${colors.priority[priority]}; border-left: 3px solid ${colors.priorityBorder[priority]}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div class="task-dot" style="background-color: ${colors.priorityBorder[priority]}"></div>
                                    <div class="task-time">${taskInfo.time}</div>
                                    <div class="task-content">${taskInfo.title}</div>
                                    <div class="task-duration">${taskInfo.duration}</div>
                                </div>
                            `;
                        }).join('') : 
                        '<div class="empty-tasks">예정된 일정이 없습니다</div>'
                    }
                </div>
            </div>
            
            <div class="time-block" style="background-color: ${colors.evening.bg}; border-left: 3px solid ${colors.evening.border}">
                <div class="time-header">
                    ${colors.evening.icon} 저녁
                </div>
                <div class="task-list">
                    ${eveningTasks.length > 0 ? 
                        eveningTasks.map(task => {
                            const priority = parsePriority(task);
                            const taskInfo = parseTaskInfo(task);
                            const taskStatus = checkTaskStatus(task);
                            
                            return `
                                <div class="task-item ${taskStatus}" style="background-color: ${colors.priority[priority]}; border-left: 3px solid ${colors.priorityBorder[priority]}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div class="task-dot" style="background-color: ${colors.priorityBorder[priority]}"></div>
                                    <div class="task-time">${taskInfo.time}</div>
                                    <div class="task-content">${taskInfo.title}</div>
                                    <div class="task-duration">${taskInfo.duration}</div>
                                </div>
                            `;
                        }).join('') : 
                        '<div class="empty-tasks">예정된 일정이 없습니다</div>'
                    }
                </div>
            </div>
        </div>
    `;
    
    return timelineHTML;
}

// 날짜 포맷팅 (요일 포함)
function formatDate(dateString) {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = days[date.getDay()];
    
    // 오늘인지 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((target - today) / (1000 * 60 * 60 * 24));
    
    let dayLabel = '';
    if (diffDays === 0) {
        dayLabel = '오늘';
    } else if (diffDays === 1) {
        dayLabel = '내일';
    } else if (diffDays === 2) {
        dayLabel = '모레';
    }
    
    // 월과 일을 가져옴
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (dayLabel) {
        return `${dayLabel} (${month}/${day})`;
    } else {
        return `${month}/${day} (${dayOfWeek})`;
    }
}

// 구글 캘린더 동기화 함수
async function syncWithGoogleCalendar(todos, analysisResult) {
    console.log('syncWithGoogleCalendar 함수 시작');
    
    // 구글 API가 초기화되었는지 확인
    if (!gapi.client) {
        console.error('gapi.client가 초기화되지 않았습니다.');
        throw new Error('구글 API가 초기화되지 않았습니다.');
    }
    
    const token = gapi.client.getToken();
    if (!token) {
        console.error('사용자 인증 토큰이 없습니다.');
        throw new Error('사용자가 인증되지 않았습니다. 구글 계정 연결 버튼을 클릭하세요.');
    }
    
    console.log('유효한 인증 토큰 확인됨:', token);
    
    try {
        console.log('구글 캘린더 동기화 시작');
        
        // 할일 데이터로부터 이벤트 생성
        const pendingTodos = Object.entries(todos || {})
            .filter(([_, todo]) => !todo.completed)
            .map(([key, todo]) => ({
                ...todo,
                id: key,
                title: todo.title || todo.text || '제목 없음'
            }));
        
        console.log(`동기화할 일정 수: ${pendingTodos.length}`);
        if (pendingTodos.length === 0) {
            console.warn('동기화할 일정이 없습니다.');
            return '동기화할 일정이 없습니다.';
        }
        
        // 캘린더 ID 확인
        const calendarId = GOOGLE_CONFIG.CALENDAR_ID || 'primary';
        console.log(`사용할 캘린더 ID: ${calendarId}`);
        
        // 기존 일정 삭제 (선택적)
        try {
            console.log('기존 일정 확인 중...');
            const response = await gapi.client.calendar.events.list({
                calendarId: calendarId,
                timeMin: (new Date()).toISOString(),
                maxResults: 100,
                q: '[할일관리]'
            });
            
            console.log('이벤트 목록 응답:', response);
            
            const existingEvents = response.result.items || [];
            console.log(`삭제할 기존 일정 수: ${existingEvents.length}`);
            
            if (existingEvents && existingEvents.length > 0) {
                for (let i = 0; i < existingEvents.length; i++) {
                    try {
                        const deleteResponse = await gapi.client.calendar.events.delete({
                            calendarId: calendarId,
                            eventId: existingEvents[i].id
                        });
                        console.log(`일정 삭제 완료: ${existingEvents[i].summary}`, deleteResponse);
                    } catch (deleteError) {
                        console.warn(`일정 삭제 실패: ${existingEvents[i].summary}`, deleteError);
                    }
                }
                console.log(`${existingEvents.length}개의 기존 일정이 삭제되었습니다.`);
            }
        } catch (error) {
            console.warn('기존 일정 삭제 중 오류:', error);
            // 오류가 발생해도 계속 진행
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        // 새 일정 추가
        for (const todo of pendingTodos) {
            if (!todo.date) {
                console.warn('날짜 없는 일정 건너뜀:', todo);
                continue;
            }
            
            try {
                const time = todo.time || '09:00';
                const startDateTime = `${todo.date}T${time}:00`;
                console.log(`일정 시작 시간: ${startDateTime}`);
                
                // 종료 시간 계산
                let endDateTime;
                if (todo.duration) {
                    const startDate = new Date(startDateTime);
                    const durationHours = parseFloat(todo.duration);
                    const durationMs = durationHours * 60 * 60 * 1000;
                    const endDate = new Date(startDate.getTime() + durationMs);
                    endDateTime = endDate.toISOString();
                } else {
                    // 기본 소요시간: 30분
                    const startDate = new Date(startDateTime);
                    startDate.setMinutes(startDate.getMinutes() + 30);
                    endDateTime = startDate.toISOString();
                }
                console.log(`일정 종료 시간: ${endDateTime}`);
                
                // 일정 색상 (중요도에 따라)
                let colorId;
                switch (todo.priority) {
                    case 'high': colorId = '11'; break; // 빨간색
                    case 'medium': colorId = '5'; break; // 노란색
                    case 'low': colorId = '10'; break; // 녹색
                    default: colorId = '1'; // 파란색
                }
                
                // 이벤트 생성
                const event = {
                    summary: `${todo.title} [할일관리]`,
                    description: todo.description || '',
                    start: {
                        dateTime: startDateTime,
                        timeZone: 'Asia/Seoul'
                    },
                    end: {
                        dateTime: endDateTime,
                        timeZone: 'Asia/Seoul'
                    },
                    colorId: colorId
                };
                
                console.log('이벤트 추가 시도:', JSON.stringify(event));
                
                const response = await gapi.client.calendar.events.insert({
                    calendarId: calendarId,
                    resource: event
                });
                
                console.log('이벤트 추가 응답:', response);
                
                if (response && response.status === 200) {
                    console.log(`일정 추가 성공: ${todo.title}`, response.result);
                    successCount++;
                } else {
                    console.warn(`일정 추가 미확인: ${todo.title}`, response);
                    errorCount++;
                }
            } catch (error) {
                console.error(`일정 추가 실패 (${todo.title}):`, error);
                errorCount++;
                // 계속 진행
            }
        }
        
        console.log(`일정 동기화 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
        return `${successCount}개의 일정이 구글 캘린더에 성공적으로 추가되었습니다.`;
    } catch (error) {
        console.error('구글 캘린더 동기화 오류:', error);
        throw new Error(`구글 캘린더 동기화에 실패했습니다: ${error.message}`);
    }
} 