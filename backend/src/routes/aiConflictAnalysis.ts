import express from 'express';
import { firestoreService } from '../services/firestoreService';

const router = express.Router();

// POST /api/ai-conflict-analysis - AI 충돌 일정 분석 요청 생성
router.post('/', async (req, res) => {
  try {
    const { conflict_id, user_id, request_params, status = '완료' } = req.body;

    // 필수 필드 검증
    if (!conflict_id || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'conflict_id와 user_id는 필수 필드입니다.'
      });
    }

    // AI 충돌 일정 분석 요청 데이터 생성
    const analysisData = {
      conflict_id,
      user_id,
      request_params: request_params || {},
      status,
      request_datetime: new Date(),
      completion_datetime: new Date()
    };

    const result = await firestoreService.createAIConflictScheduleAnalysisRequest(analysisData);

    return res.status(201).json({
      success: true,
      data: result,
      message: 'AI 충돌 일정 분석 요청이 성공적으로 생성되었습니다.'
    });

  } catch (error) {
    console.error('AI 충돌 일정 분석 요청 생성 실패:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'AI 충돌 일정 분석 요청 생성 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/ai-conflict-analysis - AI 충돌 일정 분석 요청 목록 조회
router.get('/', async (_req, res) => {
  try {
    const requests = await firestoreService.getAIConflictScheduleAnalysisRequests();

    return res.status(200).json({
      success: true,
      data: requests,
      count: requests.length,
      message: 'AI 충돌 일정 분석 요청 목록을 성공적으로 조회했습니다.'
    });

  } catch (error) {
    console.error('AI 충돌 일정 분석 요청 목록 조회 실패:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'AI 충돌 일정 분석 요청 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/ai-conflict-analysis/:id - AI 충돌 일정 분석 요청 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: '요청 ID가 필요합니다.'
      });
    }

    const request = await firestoreService.getAIConflictScheduleAnalysisRequestById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: '해당 AI 충돌 일정 분석 요청을 찾을 수 없습니다.'
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
      message: 'AI 충돌 일정 분석 요청을 성공적으로 조회했습니다.'
    });

  } catch (error) {
    console.error('AI 충돌 일정 분석 요청 상세 조회 실패:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'AI 충돌 일정 분석 요청 상세 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router; 