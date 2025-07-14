import { Request, Response, NextFunction } from 'express';
import { getAnalytics } from '../services/analyticsService';

export const getAnalyticsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, metricName, period, startDate, endDate } = req.query;
    
    // 날짜 파싱
    let startDateObj: Date | undefined = undefined;
    let endDateObj: Date | undefined = undefined;
    
    if (startDate) {
      const dateObj = new Date(startDate as string);
      if (!isNaN(dateObj.getTime())) startDateObj = dateObj;
    }
    
    if (endDate) {
      const dateObj = new Date(endDate as string);
      if (!isNaN(dateObj.getTime())) endDateObj = dateObj;
    }
    
    const analytics = await getAnalytics({
      project_id: projectId ? String(projectId) : undefined,
      metric_name: metricName ? String(metricName) : undefined,
      period: period ? (period as 'daily' | 'weekly' | 'monthly' | 'current') : undefined,
      start_date: startDateObj,
      end_date: endDateObj
    });
    
    res.json({
      success: true,
      data: analytics,
      count: analytics.length
    });
  } catch (error) {
    next(error);
  }
}; 