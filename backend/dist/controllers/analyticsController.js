"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsController = void 0;
const analyticsService_1 = require("../services/analyticsService");
const getAnalyticsController = async (req, res, next) => {
    try {
        const { projectId, metricName, period, startDate, endDate } = req.query;
        let startDateObj = undefined;
        let endDateObj = undefined;
        if (startDate) {
            const dateObj = new Date(startDate);
            if (!isNaN(dateObj.getTime()))
                startDateObj = dateObj;
        }
        if (endDate) {
            const dateObj = new Date(endDate);
            if (!isNaN(dateObj.getTime()))
                endDateObj = dateObj;
        }
        const analytics = await (0, analyticsService_1.getAnalytics)({
            projectId: projectId ? String(projectId) : undefined,
            metricName: metricName ? String(metricName) : undefined,
            period: period ? period : undefined,
            startDate: startDateObj,
            endDate: endDateObj
        });
        res.json({
            success: true,
            data: analytics,
            count: analytics.length
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAnalyticsController = getAnalyticsController;
//# sourceMappingURL=analyticsController.js.map