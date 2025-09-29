import { Request, Response } from "express";
import { ChatService } from "./chat.service";
import { SendMessageRequest } from "./chat.types";
import { ApiResponse } from "../../shared/types/common.types";

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const request: SendMessageRequest = req.body;

      if (!request.receiverId || !request.content) {
        res.status(400).json({
          success: false,
          error: "Receiver ID and content are required",
        } as ApiResponse);
        return;
      }

      const message = await this.chatService.sendMessage(user, request);

      res.status(201).json({
        success: true,
        data: message,
        message: "Message sent successfully",
      } as ApiResponse);
    } catch (error) {
      console.error("Error in sendMessage:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      } as ApiResponse);
    }
  };

  getConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const participantId = req.params.participantId;

      if (!participantId) {
        res.status(400).json({
          success: false,
          error: "Participant ID is required",
        } as ApiResponse);
        return;
      }

      const result = await this.chatService.getConversation(
        user.id,
        participantId,
      );

      res.status(200).json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      console.error("Error in getConversation:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      } as ApiResponse);
    }
  };

  getUserConversations = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const conversations = await this.chatService.getUserConversations(
        user.id,
      );

      res.status(200).json({
        success: true,
        data: conversations,
      } as ApiResponse);
    } catch (error) {
      console.error("Error in getUserConversations:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      } as ApiResponse);
    }
  };

  markMessageAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const { messageId } = req.body;

      if (!messageId) {
        res.status(400).json({
          success: false,
          error: "Message ID is required",
        } as ApiResponse);
        return;
      }

      await this.chatService.markMessageAsRead(messageId, user.id);

      res.status(200).json({
        success: true,
        message: "Message marked as read",
      } as ApiResponse);
    } catch (error) {
      console.error("Error in markMessageAsRead:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      } as ApiResponse);
    }
  };
}
