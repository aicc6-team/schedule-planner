import { Request, Response } from 'express';
export declare const scheduleController: {
    getPersonalSchedules(_req: Request, res: Response): Promise<void>;
    getDepartmentSchedules(_req: Request, res: Response): Promise<void>;
    getProjectSchedules(_req: Request, res: Response): Promise<void>;
    getAllSchedules(_req: Request, res: Response): Promise<void>;
    createPersonalSchedule(req: Request, res: Response): Promise<void>;
    getPersonalScheduleById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updatePersonalSchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deletePersonalSchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createDepartmentSchedule(req: Request, res: Response): Promise<void>;
    getDepartmentScheduleById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateDepartmentSchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteDepartmentSchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createProjectSchedule(req: Request, res: Response): Promise<void>;
    getProjectScheduleById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateProjectSchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteProjectSchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=scheduleController.d.ts.map