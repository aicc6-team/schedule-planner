import { Request, Response } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        tokens: any;
    };
}
declare class GoogleAuthController {
    getAuthUrl(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    handleCallback(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    refreshToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    validateToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCalendarEvents(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createCalendarEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCalendarList(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
declare const _default: GoogleAuthController;
export default _default;
//# sourceMappingURL=googleAuthController.d.ts.map