// OpenAI API 설정
const CONFIG = {
    OPENAI_API_KEY: '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'
};

// Google Calendar API 설정
const GOOGLE_CONFIG = {
    // 구글 캘린더 API 설정 방법:
    // 1. https://console.cloud.google.com/ 에서 새 프로젝트 생성
    //    - 우측 상단의 프로젝트 선택 드롭다운 > 새 프로젝트
    //    - 프로젝트 이름 입력 후 '만들기' 클릭
    //
    // 2. Google Calendar API 활성화
    //    - 왼쪽 메뉴에서 'API 및 서비스' > '라이브러리' 선택
    //    - 검색창에 'Calendar' 입력하여 'Google Calendar API' 찾기
    //    - 'Google Calendar API' 클릭 후 '사용' 버튼 클릭
    //
    // 3. 사용자 인증 정보 생성
    //    - 왼쪽 메뉴에서 'API 및 서비스' > '사용자 인증 정보' 선택
    //    - '사용자 인증 정보 만들기' > 'API 키' 선택
    //    - 생성된 API 키를 복사하여 아래 API_KEY에 붙여넣기
    //
    // 4. OAuth 동의 화면 구성
    //    - 왼쪽 메뉴에서 'API 및 서비스' > 'OAuth 동의 화면' 선택
    //    - '외부' 사용자 유형 선택 후 '만들기' 클릭
    //    - 앱 이름, 사용자 지원 이메일 등 필수 항목 입력 후 '저장 후 계속' 클릭
    //    - '범위 추가' 클릭하여 'Google Calendar API'에 대한 권한 추가
    //    - 나머지 단계에서는 기본값 유지하고 '저장 후 계속' 클릭하여 완료
    //
    // 5. OAuth 클라이언트 ID 생성
    //    - 왼쪽 메뉴에서 'API 및 서비스' > '사용자 인증 정보' 선택
    //    - '사용자 인증 정보 만들기' > 'OAuth 클라이언트 ID' 선택
    //    - 애플리케이션 유형: '웹 애플리케이션' 선택 (절대 '데스크톱 앱'이나 '기타'를 선택하지 마세요)
    //    - 이름 입력 (예: 'Calendar App')
    //    - 승인된 자바스크립트 출처:
    //        * http://localhost:5500
    //        * http://localhost
    //        * http://127.0.0.1:5500
    //        * https://127.0.0.1:5500
    //    - 승인된 리디렉션 URI:
    //        * http://localhost:5500
    //        * http://localhost
    //        * http://127.0.0.1:5500
    //        * https://127.0.0.1:5500
    //        * http://localhost:5500/index.html
    //        * http://localhost:5500/calendar.html
    //        * http://127.0.0.1:5500/index.html
    //        * http://127.0.0.1:5500/calendar.html
    //    - '만들기' 클릭하여 클라이언트 ID 생성
    //    - 생성된 클라이언트 ID를 복사하여 아래 CLIENT_ID에 붙여넣기
    // 
    // 주의: 'NATIVE_DESKTOP' 오류가 발생하면 구글 클라우드 콘솔에서 클라이언트 ID를 '웹 애플리케이션' 유형으로 
    // 새로 생성하고, 여기에 새 클라이언트 ID를 입력하세요.
    
    // 아래는 예시 형식입니다. 실제 발급받은 키를 입력하세요.
    API_KEY: 'AIzaSyBT_2NKGDTuR5t4rT1sShU8y1m5mUEs52U', // 예: 'AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg'
    CLIENT_ID: '166033660952-i0m4jnbho54aou25go3kki1nmu6iumaj.apps.googleusercontent.com', // 예: '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com'
    
    // 구글 캘린더 ID 설정 방법:
    // 1. 구글 캘린더 웹사이트(https://calendar.google.com)에서 원하는 캘린더 선택
    // 2. 캘린더 옆 '⋮' (더보기) 버튼 클릭 > '설정 및 공유' 선택
    // 3. '통합' 섹션에서 '캘린더 ID' 확인
    // 4. 기본 캘린더를 사용하려면 'primary'로 설정하거나 비워두기
    // 5. 개인 이메일을 사용하려면 'your.email@gmail.com' 형식으로 입력
    // 6. 공유 캘린더는 제공된 캘린더 ID 전체를 복사하여 입력
    CALENDAR_ID: '9aa2c85092c4728ed7884f373cfdcdec5b7b6d26e509e9fd9f021bac0323ccf0@group.calendar.google.com'
};

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyCRHEcgdLs1JlS0-krjF1UinnHxFkkdU4A",
    authDomain: "aicc-todo.firebaseapp.com",
    projectId: "aicc-todo",
    storageBucket: "aicc-todo.appspot.com",
    messagingSenderId: "87807823982",
    appId: "1:87807823982:web:6ecd1bebf74937fdbfd67f",
    databaseURL: "https://aicc-todo-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// 참고: 실제 Firebase 프로젝트에서 발급받은 정보로 위 값들을 교체해야 합니다. 