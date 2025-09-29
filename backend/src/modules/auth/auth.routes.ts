import { Router } from "express";
import { AuthController } from "./auth.controller";

const router: Router = Router();
const authController = new AuthController();

router.post("/createAccessCode", (req, res) =>
  authController.createAccessCode(req, res),
);
router.post("/validateAccessCode", (req, res) =>
  authController.validateAccessCode(req, res),
);
router.post("/loginEmail", (req, res) => authController.loginEmail(req, res));

export default router;
