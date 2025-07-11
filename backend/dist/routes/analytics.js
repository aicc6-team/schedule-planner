"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebase_1 = require("../config/firebase");
const firestore_1 = require("firebase-admin/firestore");
const analyticsService_1 = require("../services/analyticsService");
const router = express_1.default.Router();
router.get('/personalTasks', async (_req, res) => {
    try {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const startTimestamp = firestore_1.Timestamp.fromDate(threeMonthsAgo);
        const endTimestamp = firestore_1.Timestamp.fromDate(today);
        const snapshot = await firebase_1.db.collection('PersonalScheduleAnalysis')
            .where('date', '>=', startTimestamp)
            .where('date', '<=', endTimestamp)
            .get();
        const tasks = snapshot.docs.map((doc) => {
            const data = doc.data();
            let dateString = '';
            if (data && data['date'] && typeof data['date'].toDate === 'function') {
                dateString = data['date'].toDate().toISOString().slice(0, 10);
            }
            else if (data && data['date'] && typeof data['date'] === 'string') {
                dateString = data['date'].slice(0, 10);
            }
            else {
                dateString = '';
            }
            return {
                id: doc.id,
                ...data,
                date: dateString,
            };
        });
        res.json(tasks);
    }
    catch (error) {
        console.error('Error fetching personal tasks:', error);
        res.status(500).json({ error: 'Failed to fetch personal tasks' });
    }
});
router.get('/departmentTasks', async (req, res) => {
    try {
        const { department_name, date } = req.query;
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const startTimestamp = firestore_1.Timestamp.fromDate(threeMonthsAgo);
        const endTimestamp = firestore_1.Timestamp.fromDate(today);
        let query = firebase_1.db.collection('DepartmentScheduleAnalysis');
        if (department_name) {
            query = query.where('department_name', '==', department_name);
        }
        if (date) {
            query = query.where('date', '==', date);
        }
        else {
            query = query.where('date', '>=', startTimestamp).where('date', '<=', endTimestamp);
        }
        const snapshot = await query.get();
        const analysis = snapshot.docs.map((doc) => {
            const data = doc.data();
            let dateString = '';
            if (data && data['date'] && typeof data['date'].toDate === 'function') {
                dateString = data['date'].toDate().toISOString().slice(0, 10);
            }
            else if (data && data['date'] && typeof data['date'] === 'string') {
                dateString = data['date'].slice(0, 10);
            }
            else {
                dateString = '';
            }
            return {
                id: doc.id,
                ...data,
                date: dateString,
            };
        });
        const analysisArray = Array.isArray(analysis) ? analysis : [];
        res.json(analysisArray);
    }
    catch (error) {
        console.error('Error fetching department analysis:', error);
        res.status(500).json({ error: 'Failed to fetch department analysis' });
    }
});
router.get('/companyTasks', async (req, res) => {
    try {
        const { schedule_id, analysis_start_date, analysis_end_date } = req.query;
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const startTimestamp = firestore_1.Timestamp.fromDate(threeMonthsAgo);
        const endTimestamp = firestore_1.Timestamp.fromDate(today);
        let query = firebase_1.db.collection('CompanyScheduleAnalysis');
        if (schedule_id) {
            query = query.where('schedule_id', '==', schedule_id);
        }
        if (analysis_start_date && analysis_end_date) {
            query = query.where('analysis_start_date', '==', analysis_start_date)
                .where('analysis_end_date', '==', analysis_end_date);
        }
        else {
            query = query.where('analysis_start_date', '>=', startTimestamp)
                .where('analysis_end_date', '<=', endTimestamp);
        }
        const snapshot = await query.get();
        const analysis = snapshot.docs.map((doc) => {
            const data = doc.data();
            let startDateStr = '';
            let endDateStr = '';
            if (data && data['analysis_start_date'] && typeof data['analysis_start_date'].toDate === 'function') {
                startDateStr = data['analysis_start_date'].toDate().toISOString().slice(0, 10);
            }
            else if (data && data['analysis_start_date'] && typeof data['analysis_start_date'] === 'string') {
                startDateStr = data['analysis_start_date'].slice(0, 10);
            }
            if (data && data['analysis_end_date'] && typeof data['analysis_end_date'].toDate === 'function') {
                endDateStr = data['analysis_end_date'].toDate().toISOString().slice(0, 10);
            }
            else if (data && data['analysis_end_date'] && typeof data['analysis_end_date'] === 'string') {
                endDateStr = data['analysis_end_date'].slice(0, 10);
            }
            return {
                id: doc.id,
                ...data,
                analysis_start_date: startDateStr,
                analysis_end_date: endDateStr,
            };
        });
        const analysisArray = Array.isArray(analysis) ? analysis : [];
        res.json(analysisArray);
    }
    catch (error) {
        console.error('Error fetching company analysis:', error);
        res.status(500).json({ error: 'Failed to fetch company analysis' });
    }
});
router.get('/projectTasks', async (req, res) => {
    try {
        const { project_id, date } = req.query;
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const startTimestamp = firestore_1.Timestamp.fromDate(threeMonthsAgo);
        const endTimestamp = firestore_1.Timestamp.fromDate(today);
        let query = firebase_1.db.collection('ProjectScheduleAnalysis');
        if (project_id) {
            query = query.where('project_id', '==', project_id);
        }
        if (date) {
            query = query.where('date', '==', date);
        }
        else {
            query = query.where('date', '>=', startTimestamp).where('date', '<=', endTimestamp);
        }
        const snapshot = await query.get();
        const analysis = snapshot.docs.map((doc) => {
            const data = doc.data();
            let dateString = '';
            if (data && data['date'] && typeof data['date'].toDate === 'function') {
                dateString = data['date'].toDate().toISOString().slice(0, 10);
            }
            else if (data && data['date'] && typeof data['date'] === 'string') {
                dateString = data['date'].slice(0, 10);
            }
            else {
                dateString = '';
            }
            return {
                id: doc.id,
                ...data,
                date: dateString,
            };
        });
        const analysisArray = Array.isArray(analysis) ? analysis : [];
        res.json(analysisArray);
    }
    catch (error) {
        console.error('Error fetching project analysis:', error);
        res.status(500).json({ error: 'Failed to fetch project analysis' });
    }
});
router.get('/projectDependencies', async (_req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('ProjectDependenciesAnalysis').get();
        const dependencies = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(dependencies);
    }
    catch (error) {
        console.error('Error fetching project dependencies:', error);
        res.status(500).json({ error: 'Failed to fetch project dependencies' });
    }
});
router.get('/projectSimulations', async (_req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('ProjectSimulationsAnalysis').get();
        const simulations = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(simulations);
    }
    catch (error) {
        console.error('Error fetching project simulations:', error);
        res.status(500).json({ error: 'Failed to fetch project simulations' });
    }
});
router.get('/projectProgress', async (_req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('ProjectProgressAnalysis').get();
        const progress = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(progress);
    }
    catch (error) {
        console.error('Error fetching project progress:', error);
        res.status(500).json({ error: 'Failed to fetch project progress' });
    }
});
router.get('/projectCosts', async (_req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('projectCostsAnalysis').get();
        const costs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(costs);
    }
    catch (error) {
        console.error('Error fetching project costs:', error);
        res.status(500).json({ error: 'Failed to fetch project costs' });
    }
});
router.post('/generateReport', async (req, res) => {
    try {
        const userId = "user01";
        const scheduleData = await (0, analyticsService_1.getRecentPersonalSchedule)();
        const { summary, advice } = await (0, analyticsService_1.getKoreanAnalysis)(scheduleData);
        const statsTable = (0, analyticsService_1.makeStatsForPrompt)(scheduleData);
        const periodLabel = `분석기간: ${(0, analyticsService_1.getPeriodLabel)(3)} (최근 3개월)`;
        const { chartImages, chartDescriptions } = req.body;
        const pdfBuffer = await (0, analyticsService_1.generatePDFBuffer)(summary, advice, statsTable, scheduleData, periodLabel, chartImages, chartDescriptions);
        await (0, analyticsService_1.saveReportRecord)(userId, summary, statsTable, scheduleData, periodLabel);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="personal-analytics-report-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.status(200).send(pdfBuffer);
    }
    catch (e) {
        console.error(e);
        res.status(500).send('보고서 생성 실패');
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map