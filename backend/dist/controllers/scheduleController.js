"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleController = void 0;
const firestoreService_1 = require("../services/firestoreService");
exports.scheduleController = {
    async getPersonalSchedules(_req, res) {
        try {
            const schedules = await firestoreService_1.firestoreService.getPersonalSchedules();
            res.status(200).json({
                success: true,
                data: schedules,
                message: '개인 일정 목록 조회 성공',
                count: schedules.length
            });
        }
        catch (error) {
            console.error('개인 일정 조회 실패:', error);
            res.status(500).json({
                success: false,
                error: '개인 일정을 조회하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async getDepartmentSchedules(_req, res) {
        try {
            const schedules = await firestoreService_1.firestoreService.getDepartmentSchedules();
            res.status(200).json({
                success: true,
                data: schedules,
                message: '부서 일정 목록 조회 성공',
                count: schedules.length
            });
        }
        catch (error) {
            console.error('부서 일정 조회 실패:', error);
            res.status(500).json({
                success: false,
                error: '부서 일정을 조회하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async getProjectSchedules(_req, res) {
        try {
            const schedules = await firestoreService_1.firestoreService.getProjectSchedules();
            res.status(200).json({
                success: true,
                data: schedules,
                message: '프로젝트 일정 목록 조회 성공',
                count: schedules.length
            });
        }
        catch (error) {
            console.error('프로젝트 일정 조회 실패:', error);
            res.status(500).json({
                success: false,
                error: '프로젝트 일정을 조회하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async getAllSchedules(_req, res) {
        try {
            const allSchedules = await firestoreService_1.firestoreService.getAllSchedules();
            res.status(200).json({
                success: true,
                data: allSchedules,
                message: '전체 일정 목록 조회 성공',
                count: {
                    personal: allSchedules.personal.length,
                    department: allSchedules.department.length,
                    project: allSchedules.project.length,
                    total: allSchedules.personal.length + allSchedules.department.length + allSchedules.project.length
                }
            });
        }
        catch (error) {
            console.error('전체 일정 조회 실패:', error);
            res.status(500).json({
                success: false,
                error: '전체 일정을 조회하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async createPersonalSchedule(req, res) {
        try {
            const schedule = await firestoreService_1.firestoreService.createPersonalSchedule(req.body);
            res.status(201).json({
                success: true,
                data: schedule,
                message: '개인 일정 생성 성공'
            });
        }
        catch (error) {
            console.error('개인 일정 생성 실패:', error);
            res.status(500).json({
                success: false,
                error: '개인 일정을 생성하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async getPersonalScheduleById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'ID가 필요합니다.'
                });
            }
            const schedule = await firestoreService_1.firestoreService.getPersonalScheduleById(id);
            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    error: '개인 일정을 찾을 수 없습니다.'
                });
            }
            return res.status(200).json({
                success: true,
                data: schedule,
                message: '개인 일정 조회 성공'
            });
        }
        catch (error) {
            console.error('개인 일정 조회 실패:', error);
            return res.status(500).json({
                success: false,
                error: '개인 일정을 조회하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async updatePersonalSchedule(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'ID가 필요합니다.'
                });
            }
            const schedule = await firestoreService_1.firestoreService.updatePersonalSchedule(id, req.body);
            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    error: '개인 일정을 찾을 수 없습니다.'
                });
            }
            return res.status(200).json({
                success: true,
                data: schedule,
                message: '개인 일정 수정 성공'
            });
        }
        catch (error) {
            console.error('개인 일정 수정 실패:', error);
            return res.status(500).json({
                success: false,
                error: '개인 일정을 수정하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async deletePersonalSchedule(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'ID가 필요합니다.'
                });
            }
            await firestoreService_1.firestoreService.deletePersonalSchedule(id);
            return res.status(200).json({
                success: true,
                message: '개인 일정 삭제 성공'
            });
        }
        catch (error) {
            console.error('개인 일정 삭제 실패:', error);
            return res.status(500).json({
                success: false,
                error: '개인 일정을 삭제하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async createDepartmentSchedule(req, res) {
        try {
            const schedule = await firestoreService_1.firestoreService.createDepartmentSchedule(req.body);
            res.status(201).json({
                success: true,
                data: schedule,
                message: '부서 일정 생성 성공'
            });
        }
        catch (error) {
            console.error('부서 일정 생성 실패:', error);
            res.status(500).json({
                success: false,
                error: '부서 일정을 생성하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async getDepartmentScheduleById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'ID가 필요합니다.'
                });
            }
            const schedule = await firestoreService_1.firestoreService.getDepartmentScheduleById(id);
            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    error: '부서 일정을 찾을 수 없습니다.'
                });
            }
            return res.status(200).json({
                success: true,
                data: schedule,
                message: '부서 일정 조회 성공'
            });
        }
        catch (error) {
            console.error('부서 일정 조회 실패:', error);
            return res.status(500).json({
                success: false,
                error: '부서 일정을 조회하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async updateDepartmentSchedule(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'ID가 필요합니다.'
                });
            }
            const schedule = await firestoreService_1.firestoreService.updateDepartmentSchedule(id, req.body);
            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    error: '부서 일정을 찾을 수 없습니다.'
                });
            }
            return res.status(200).json({
                success: true,
                data: schedule,
                message: '부서 일정 수정 성공'
            });
        }
        catch (error) {
            console.error('부서 일정 수정 실패:', error);
            return res.status(500).json({
                success: false,
                error: '부서 일정을 수정하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async deleteDepartmentSchedule(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'ID가 필요합니다.'
                });
            }
            await firestoreService_1.firestoreService.deleteDepartmentSchedule(id);
            return res.status(200).json({
                success: true,
                message: '부서 일정 삭제 성공'
            });
        }
        catch (error) {
            console.error('부서 일정 삭제 실패:', error);
            return res.status(500).json({
                success: false,
                error: '부서 일정을 삭제하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async createProjectSchedule(req, res) {
        try {
            const schedule = await firestoreService_1.firestoreService.createProjectSchedule(req.body);
            res.status(201).json({
                success: true,
                data: schedule,
                message: '프로젝트 일정 생성 성공'
            });
        }
        catch (error) {
            console.error('프로젝트 일정 생성 실패:', error);
            res.status(500).json({
                success: false,
                error: '프로젝트 일정을 생성하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async getProjectScheduleById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'ID가 필요합니다.'
                });
            }
            const schedule = await firestoreService_1.firestoreService.getProjectScheduleById(id);
            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    error: '프로젝트 일정을 찾을 수 없습니다.'
                });
            }
            return res.status(200).json({
                success: true,
                data: schedule,
                message: '프로젝트 일정 조회 성공'
            });
        }
        catch (error) {
            console.error('프로젝트 일정 조회 실패:', error);
            return res.status(500).json({
                success: false,
                error: '프로젝트 일정을 조회하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async updateProjectSchedule(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'ID가 필요합니다.'
                });
            }
            const schedule = await firestoreService_1.firestoreService.updateProjectSchedule(id, req.body);
            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    error: '프로젝트 일정을 찾을 수 없습니다.'
                });
            }
            return res.status(200).json({
                success: true,
                data: schedule,
                message: '프로젝트 일정 수정 성공'
            });
        }
        catch (error) {
            console.error('프로젝트 일정 수정 실패:', error);
            return res.status(500).json({
                success: false,
                error: '프로젝트 일정을 수정하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    },
    async deleteProjectSchedule(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'ID가 필요합니다.'
                });
            }
            await firestoreService_1.firestoreService.deleteProjectSchedule(id);
            return res.status(200).json({
                success: true,
                message: '프로젝트 일정 삭제 성공'
            });
        }
        catch (error) {
            console.error('프로젝트 일정 삭제 실패:', error);
            return res.status(500).json({
                success: false,
                error: '프로젝트 일정을 삭제하는 중 오류가 발생했습니다.',
                message: error instanceof Error ? error.message : '알 수 없는 오류'
            });
        }
    }
};
//# sourceMappingURL=scheduleController.js.map