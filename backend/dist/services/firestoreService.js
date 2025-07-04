"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestoreService = void 0;
const firebase_1 = require("../config/firebase");
exports.firestoreService = {
    async getPersonalSchedules() {
        try {
            const snapshot = await firebase_1.db.collection('personal_schedules').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            console.error('개인 일정 조회 실패:', error);
            throw new Error('개인 일정을 조회하는 중 오류가 발생했습니다.');
        }
    },
    async getDepartmentSchedules() {
        try {
            const snapshot = await firebase_1.db.collection('department_schedules').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            console.error('부서 일정 조회 실패:', error);
            throw new Error('부서 일정을 조회하는 중 오류가 발생했습니다.');
        }
    },
    async getProjectSchedules() {
        try {
            const snapshot = await firebase_1.db.collection('project_schedules').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            console.error('프로젝트 일정 조회 실패:', error);
            throw new Error('프로젝트 일정을 조회하는 중 오류가 발생했습니다.');
        }
    },
    async getAllSchedules() {
        try {
            const [personal, department, project] = await Promise.all([
                this.getPersonalSchedules(),
                this.getDepartmentSchedules(),
                this.getProjectSchedules()
            ]);
            return {
                personal,
                department,
                project
            };
        }
        catch (error) {
            console.error('전체 일정 조회 실패:', error);
            throw new Error('전체 일정을 조회하는 중 오류가 발생했습니다.');
        }
    }
};
//# sourceMappingURL=firestoreService.js.map