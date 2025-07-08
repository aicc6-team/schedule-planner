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
    },
    async createPersonalSchedule(data) {
        try {
            const now = new Date().toISOString();
            const scheduleData = {
                ...data,
                createdAt: now,
                updatedAt: now
            };
            const docRef = await firebase_1.db.collection('personal_schedules').add(scheduleData);
            return {
                id: docRef.id,
                ...scheduleData
            };
        }
        catch (error) {
            console.error('개인 일정 생성 실패:', error);
            throw new Error('개인 일정을 생성하는 중 오류가 발생했습니다.');
        }
    },
    async getPersonalScheduleById(id) {
        try {
            const doc = await firebase_1.db.collection('personal_schedules').doc(id).get();
            if (!doc.exists)
                return null;
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        catch (error) {
            console.error('개인 일정 상세 조회 실패:', error);
            throw new Error('개인 일정을 조회하는 중 오류가 발생했습니다.');
        }
    },
    async updatePersonalSchedule(id, data) {
        try {
            const updateData = {
                ...data,
                updatedAt: new Date().toISOString()
            };
            await firebase_1.db.collection('personal_schedules').doc(id).update(updateData);
            return await this.getPersonalScheduleById(id);
        }
        catch (error) {
            console.error('개인 일정 수정 실패:', error);
            throw new Error('개인 일정을 수정하는 중 오류가 발생했습니다.');
        }
    },
    async deletePersonalSchedule(id) {
        try {
            await firebase_1.db.collection('personal_schedules').doc(id).delete();
            return true;
        }
        catch (error) {
            console.error('개인 일정 삭제 실패:', error);
            throw new Error('개인 일정을 삭제하는 중 오류가 발생했습니다.');
        }
    },
    async createDepartmentSchedule(data) {
        try {
            const now = new Date().toISOString();
            const scheduleData = {
                ...data,
                createdAt: now,
                updatedAt: now
            };
            const docRef = await firebase_1.db.collection('department_schedules').add(scheduleData);
            return {
                id: docRef.id,
                ...scheduleData
            };
        }
        catch (error) {
            console.error('부서 일정 생성 실패:', error);
            throw new Error('부서 일정을 생성하는 중 오류가 발생했습니다.');
        }
    },
    async getDepartmentScheduleById(id) {
        try {
            const doc = await firebase_1.db.collection('department_schedules').doc(id).get();
            if (!doc.exists)
                return null;
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        catch (error) {
            console.error('부서 일정 상세 조회 실패:', error);
            throw new Error('부서 일정을 조회하는 중 오류가 발생했습니다.');
        }
    },
    async updateDepartmentSchedule(id, data) {
        try {
            const updateData = {
                ...data,
                updatedAt: new Date().toISOString()
            };
            await firebase_1.db.collection('department_schedules').doc(id).update(updateData);
            return await this.getDepartmentScheduleById(id);
        }
        catch (error) {
            console.error('부서 일정 수정 실패:', error);
            throw new Error('부서 일정을 수정하는 중 오류가 발생했습니다.');
        }
    },
    async deleteDepartmentSchedule(id) {
        try {
            await firebase_1.db.collection('department_schedules').doc(id).delete();
            return true;
        }
        catch (error) {
            console.error('부서 일정 삭제 실패:', error);
            throw new Error('부서 일정을 삭제하는 중 오류가 발생했습니다.');
        }
    },
    async createProjectSchedule(data) {
        try {
            const now = new Date().toISOString();
            const scheduleData = {
                ...data,
                createdAt: now,
                updatedAt: now
            };
            const docRef = await firebase_1.db.collection('project_schedules').add(scheduleData);
            return {
                id: docRef.id,
                ...scheduleData
            };
        }
        catch (error) {
            console.error('프로젝트 일정 생성 실패:', error);
            throw new Error('프로젝트 일정을 생성하는 중 오류가 발생했습니다.');
        }
    },
    async getProjectScheduleById(id) {
        try {
            const doc = await firebase_1.db.collection('project_schedules').doc(id).get();
            if (!doc.exists)
                return null;
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        catch (error) {
            console.error('프로젝트 일정 상세 조회 실패:', error);
            throw new Error('프로젝트 일정을 조회하는 중 오류가 발생했습니다.');
        }
    },
    async updateProjectSchedule(id, data) {
        try {
            const updateData = {
                ...data,
                updatedAt: new Date().toISOString()
            };
            await firebase_1.db.collection('project_schedules').doc(id).update(updateData);
            return await this.getProjectScheduleById(id);
        }
        catch (error) {
            console.error('프로젝트 일정 수정 실패:', error);
            throw new Error('프로젝트 일정을 수정하는 중 오류가 발생했습니다.');
        }
    },
    async deleteProjectSchedule(id) {
        try {
            await firebase_1.db.collection('project_schedules').doc(id).delete();
            return true;
        }
        catch (error) {
            console.error('프로젝트 일정 삭제 실패:', error);
            throw new Error('프로젝트 일정을 삭제하는 중 오류가 발생했습니다.');
        }
    }
};
//# sourceMappingURL=firestoreService.js.map