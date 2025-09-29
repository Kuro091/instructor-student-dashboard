import { Router } from "express";
import { InstructorController } from "./instructor.controller";
import {
  authenticateToken,
  requireRole,
} from "../../shared/middleware/auth.middleware";
import { Role } from "../auth/auth.types";

const router: Router = Router();
const instructorController = new InstructorController();

router.use(authenticateToken);
router.use(requireRole(Role.INSTRUCTOR));

router.post("/addStudent", (req, res, next) =>
  instructorController.addStudent(req, res, next),
);

router.post("/assignLesson", (req, res, next) =>
  instructorController.assignLesson(req, res, next),
);

router.get("/students", (req, res, next) =>
  instructorController.getAllStudents(req, res, next),
);

router.get("/student/:phone", (req, res, next) =>
  instructorController.getStudentByPhone(req, res, next),
);

router.put("/editStudent/:phone", (req, res, next) =>
  instructorController.editStudent(req, res, next),
);

router.delete("/student/:phone", (req, res, next) =>
  instructorController.deleteStudent(req, res, next),
);

export default router;
