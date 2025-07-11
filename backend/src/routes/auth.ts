import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin123@email.com' && password === 'admin123') {
    return res.json({
      success: true,
      user: { email, name: '관리자' },
      token: 'dummy-token'
    });
  }
  return res.status(401).json({ success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
});

export default router; 