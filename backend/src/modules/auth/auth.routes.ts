import { Router } from "express";
import { AuthController } from "./auth.controller";

const router: Router = Router();
const authController = new AuthController();

router.post("/createAccessCode", authController.createAccessCode);
router.post("/validateAccessCode", authController.validateAccessCode);
router.post("/loginEmail", authController.loginEmail);

export default router;
