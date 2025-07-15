import express from 'express';
const router = express.Router();

// === 일반 로그인(이메일/비밀번호) 라우터 ===
router.post('/login', async (req, res) => {
  const { id, password } = req.body;
  // 하드코딩 어드민 계정
  if (id === 'admin123@email.com' && password === 'admin123') {
    return res.json({
      success: true,
      user: {
        id: 'admin123@email.com',
        role: 'admin',
        name: '관리자',
      },
      token: 'test-admin-token', // 실제 서비스는 JWT 등 발급
      message: '어드민 계정 로그인 성공'
    });
  }
  // 실제 사용자 인증 로직(DB 등) 추가 가능
  return res.status(401).json({
    success: false,
    error: '아이디 또는 비밀번호가 올바르지 않습니다.'
  });
});

export default router; 