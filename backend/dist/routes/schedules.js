"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scheduleController_1 = require("../controllers/scheduleController");
const router = (0, express_1.Router)();
router.get('/personal', scheduleController_1.scheduleController.getPersonalSchedules);
router.get('/department', scheduleController_1.scheduleController.getDepartmentSchedules);
router.get('/project', scheduleController_1.scheduleController.getProjectSchedules);
router.get('/all', scheduleController_1.scheduleController.getAllSchedules);
exports.default = router;
//# sourceMappingURL=schedules.js.map