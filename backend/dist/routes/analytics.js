"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebase_1 = require("../config/firebase");
const analyticsService_1 = require("../services/analyticsService");
const router = express_1.default.Router();
router.get('/personalTasks', async (_req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('PersonalScheduleAnalysis').get();
        const tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(tasks);
    }
    catch (error) {
        console.error('Error fetching personal tasks:', error);
        res.status(500).json({ error: 'Failed to fetch personal tasks' });
    }
});
router.get('/departmentTasks', async (req, res) => {
    try {
        const { departmentName, date } = req.query;
        let query = firebase_1.db.collection('DepartmentScheduleAnalysis');
        if (departmentName) {
            query = query.where('department_name', '==', departmentName);
        }
        if (date) {
            query = query.where('date', '==', date);
        }
        const snapshot = await query.get();
        const analysis = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
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
        const { scheduleId, analysisStartDate, analysisEndDate } = req.query;
        let query = firebase_1.db.collection('CompanyScheduleAnalysis');
        if (scheduleId) {
            query = query.where('schedule_id', '==', scheduleId);
        }
        if (analysisStartDate) {
            query = query.where('analysis_start_date', '==', analysisStartDate);
        }
        if (analysisEndDate) {
            query = query.where('analysis_end_date', '==', analysisEndDate);
        }
        const snapshot = await query.get();
        const analysis = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
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
        const { projectId, date } = req.query;
        let query = firebase_1.db.collection('ProjectScheduleAnalysis');
        if (projectId) {
            query = query.where('project_id', '==', projectId);
        }
        if (date) {
            query = query.where('date', '==', date);
        }
        const snapshot = await query.get();
        const analysis = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
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