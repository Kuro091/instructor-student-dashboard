import { Router } from "express";
import { StudentAuthController } from "./student-auth.controller";

const router: Router = Router();
const studentAuthController = new StudentAuthController();

router.post("/setup", (req, res, next) =>
  studentAuthController.setupStudentAccount(req, res, next),
);

router.post("/login", (req, res, next) =>
  studentAuthController.loginStudent(req, res, next),
);

router.get("/by-email/:email", (req, res, next) =>
  studentAuthController.getStudentByEmail(req, res, next),
);

router.get("/validate-token/:token", (req, res, next) =>
  studentAuthController.validateSetupToken(req, res, next),
);

export default router;
