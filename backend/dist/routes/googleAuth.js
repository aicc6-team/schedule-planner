"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleAuthController_1 = __importDefault(require("../controllers/googleAuthController"));
const router = express_1.default.Router();
router.get('/', googleAuthController_1.default.getAuthUrl);
router.get('/callback', googleAuthController_1.default.handleCallback);
router.post('/refresh', googleAuthController_1.default.refreshToken);
router.post('/validate', googleAuthController_1.default.validateToken);
router.post('/calendar/events', googleAuthController_1.default.getCalendarEvents);
router.post('/calendar/events/create', googleAuthController_1.default.createCalendarEvent);
router.post('/calendar/list', googleAuthController_1.default.getCalendarList);
exports.default = router;
//# sourceMappingURL=googleAuth.js.map