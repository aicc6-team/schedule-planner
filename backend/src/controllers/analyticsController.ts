import { Request, Response, NextFunction } from 'express';
import { getAnalytics } from '../services/analyticsService';

export const getAnalyticsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { project_id, metric_name, period, start_date, end_date } = req.query;
    // 날짜 파싱
    let startDateObj: Date | undefined = undefined;
    let endDateObj: Date | undefined = undefined;
    if (start_date) {
      const d = new Date(start_date as string);
      if (!isNaN(d.getTime())) startDateObj = d;
    }
    if (end_date) {
      const d = new Date(end_date as string);
      if (!isNaN(d.getTime())) endDateObj = d;
    }
    const analytics = await getAnalytics({
      project_id: project_id ? String(project_id) : undefined,
      metric_name: metric_name ? String(metric_name) : undefined,
      period: period ? (period as 'daily' | 'weekly' | 'monthly' | 'current') : undefined,
      start_date: startDateObj,
      end_date: endDateObj
    });
    res.json({
      success: true,
      data: analytics,
      total: analytics.length
    });
  } catch (error) {
    next(error);
  }
}; 