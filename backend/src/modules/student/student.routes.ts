import { Router } from "express";
import { StudentController } from "./student.controller";
import {
  authenticateToken,
  requireRole,
} from "../../shared/middleware/auth.middleware";
import { Role } from "../auth/auth.types";

const router: Router = Router();
const studentController = new StudentController();

router.use(authenticateToken);
router.use(requireRole(Role.STUDENT));

router.get("/myLessons", (req, res, next) =>
  studentController.getMyLessons(req, res, next),
);

router.post("/markLessonDone", (req, res, next) =>
  studentController.markLessonDone(req, res, next),
);

router.put("/editProfile", (req, res, next) =>
  studentController.editProfile(req, res, next),
);

export default router;
