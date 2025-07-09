import { Router } from 'express';
import { scheduleController } from '../controllers/scheduleController';

const router = Router();

// === 조회 API ===
// 개인 일정 조회
router.get('/personal', scheduleController.getPersonalSchedules);

// 부서 일정 조회
router.get('/department', scheduleController.getDepartmentSchedules);

// 프로젝트 일정 조회
router.get('/project', scheduleController.getProjectSchedules);

// 모든 일정 조회 (통합)
router.get('/all', scheduleController.getAllSchedules);

// === 개인 일정 CRUD ===
// 개인 일정 생성
router.post('/personal', scheduleController.createPersonalSchedule);

// 개인 일정 상세 조회
router.get('/personal/:id', scheduleController.getPersonalScheduleById);

// 개인 일정 수정
router.put('/personal/:id', scheduleController.updatePersonalSchedule);

// 개인 일정 삭제
router.delete('/personal/:id', scheduleController.deletePersonalSchedule);

// === 부서 일정 CRUD ===
// 부서 일정 생성
router.post('/department', scheduleController.createDepartmentSchedule);

// 부서 일정 상세 조회
router.get('/department/:id', scheduleController.getDepartmentScheduleById);

// 부서 일정 수정
router.put('/department/:id', scheduleController.updateDepartmentSchedule);

// 부서 일정 삭제
router.delete('/department/:id', scheduleController.deleteDepartmentSchedule);

// === 프로젝트 일정 CRUD ===
// 프로젝트 일정 생성
router.post('/project', scheduleController.createProjectSchedule);

// 프로젝트 일정 상세 조회
router.get('/project/:id', scheduleController.getProjectScheduleById);

// 프로젝트 일정 수정
router.put('/project/:id', scheduleController.updateProjectSchedule);

// 프로젝트 일정 삭제
router.delete('/project/:id', scheduleController.deleteProjectSchedule);

export default router;

//ff