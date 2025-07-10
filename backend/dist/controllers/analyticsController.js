"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsController = void 0;
const analyticsService_1 = require("../services/analyticsService");
const getAnalyticsController = async (req, res, next) => {
    try {
        const { project_id, metric_name, period, start_date, end_date } = req.query;
        let startDateObj = undefined;
        let endDateObj = undefined;
        if (start_date) {
            const d = new Date(start_date);
            if (!isNaN(d.getTime()))
                startDateObj = d;
        }
        if (end_date) {
            const d = new Date(end_date);
            if (!isNaN(d.getTime()))
                endDateObj = d;
        }
        const analytics = await (0, analyticsService_1.getAnalytics)({
            project_id: project_id ? String(project_id) : undefined,
            metric_name: metric_name ? String(metric_name) : undefined,
            period: period ? period : undefined,
            start_date: startDateObj,
            end_date: endDateObj
        });
        res.json({
            success: true,
            data: analytics,
            total: analytics.length
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAnalyticsController = getAnalyticsController;
//# sourceMappingURL=analyticsController.js.map