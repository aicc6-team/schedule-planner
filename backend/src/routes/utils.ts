import express from 'express';
const router = express.Router();

// GET /api/utils/today - 오늘 날짜 반환 (KST 기준)
router.get('/today', (_req, res) => {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const todayStr = kst.toISOString().slice(0, 10);
  res.json({ today: todayStr });
});

export default router; 