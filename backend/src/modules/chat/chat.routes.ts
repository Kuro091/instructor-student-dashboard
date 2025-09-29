import { Router } from "express";
import { ChatController } from "./chat.controller";
import { authenticateToken } from "../../shared/middleware/auth.middleware";

const router: Router = Router();
const chatController = new ChatController();

router.use(authenticateToken);

router.post("/send", chatController.sendMessage);
router.get("/conversation/:participantId", chatController.getConversation);
router.get("/conversations", chatController.getUserConversations);
router.post("/mark-read", chatController.markMessageAsRead);

export default router;
