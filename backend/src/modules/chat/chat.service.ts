import { db } from "../../shared/config/firebase";
import { Message, Conversation, SendMessageRequest } from "./chat.types";
import { AuthUser } from "../auth/auth.types";

export class ChatService {
  private readonly messagesCollection = "messages";
  private readonly conversationsCollection = "conversations";

  async sendMessage(
    sender: AuthUser,
    request: SendMessageRequest,
  ): Promise<Message> {
    try {
      const receiverDoc = await db
        .collection("users")
        .doc(request.receiverId)
        .get();
      if (!receiverDoc.exists) {
        throw new Error("Receiver not found");
      }
      const receiverData = receiverDoc.data()!;

      const messageId = db.collection(this.messagesCollection).doc().id;
      const message: Message = {
        id: messageId,
        senderId: sender.id,
        senderName: sender.name,
        senderRole: sender.role,
        receiverId: request.receiverId,
        receiverName: receiverData.name,
        receiverRole: receiverData.role,
        content: request.content,
        timestamp: new Date(),
        isRead: false,
      };

      await db.collection(this.messagesCollection).doc(messageId).set(message);

      await this.updateConversation(sender.id, request.receiverId, message);

      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  }

  async getConversation(
    userId: string,
    participantId: string,
  ): Promise<{ conversation: Conversation; messages: Message[] }> {
    try {
      const conversationQuery = await db
        .collection(this.conversationsCollection)
        .where("participants.instructorId", "in", [userId, participantId])
        .where("participants.studentId", "in", [userId, participantId])
        .limit(1)
        .get();

      let conversation: Conversation;
      if (conversationQuery.empty) {
        conversation = await this.createConversation(userId, participantId);
      } else {
        const conversationDoc = conversationQuery.docs[0];
        conversation = {
          id: conversationDoc.id,
          ...conversationDoc.data(),
        } as Conversation;
      }

      const messagesQuery = await db
        .collection(this.messagesCollection)
        .where("senderId", "in", [userId, participantId])
        .where("receiverId", "in", [userId, participantId])
        .orderBy("timestamp", "asc")
        .get();

      const messages = messagesQuery.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Message,
      );

      return { conversation, messages };
    } catch (error) {
      console.error("Error getting conversation:", error);
      throw new Error("Failed to get conversation");
    }
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const instructorConversationsQuery = await db
        .collection(this.conversationsCollection)
        .where("participants.instructorId", "==", userId)
        .get();

      const studentConversationsQuery = await db
        .collection(this.conversationsCollection)
        .where("participants.studentId", "==", userId)
        .get();

      const allConversations = [
        ...instructorConversationsQuery.docs,
        ...studentConversationsQuery.docs,
      ];

      const uniqueConversations = allConversations
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Conversation)
        .filter(
          (conv, index, self) =>
            index === self.findIndex((c) => c.id === conv.id),
        )
        .sort((a, b) => {
          const getTime = (
            timestamp:
              | Date
              | { _seconds: number; _nanoseconds: number }
              | undefined,
          ) => {
            if (!timestamp) return 0;
            if (timestamp instanceof Date) return timestamp.getTime();
            if ("_seconds" in timestamp) return timestamp._seconds * 1000;
            return 0;
          };

          const aTime = getTime(a.lastMessageAt);
          const bTime = getTime(b.lastMessageAt);
          return bTime - aTime;
        });

      return uniqueConversations;
    } catch (error) {
      console.error("Error getting user conversations:", error);
      throw new Error("Failed to get conversations");
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const messageDoc = await db
        .collection(this.messagesCollection)
        .doc(messageId)
        .get();
      if (!messageDoc.exists) {
        throw new Error("Message not found");
      }

      const messageData = messageDoc.data()!;
      if (messageData.receiverId !== userId) {
        throw new Error("Unauthorized to mark this message as read");
      }

      await db.collection(this.messagesCollection).doc(messageId).update({
        isRead: true,
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw new Error("Failed to mark message as read");
    }
  }

  private async createConversation(
    userId: string,
    participantId: string,
  ): Promise<Conversation> {
    const [userDoc, participantDoc] = await Promise.all([
      db.collection("users").doc(userId).get(),
      db.collection("users").doc(participantId).get(),
    ]);

    if (!userDoc.exists || !participantDoc.exists) {
      throw new Error("User or participant not found");
    }

    const userData = userDoc.data()!;
    const participantData = participantDoc.data()!;

    const isUserInstructor = userData.role === "INSTRUCTOR";
    const instructorId = isUserInstructor ? userId : participantId;
    const instructorName = isUserInstructor
      ? userData.name
      : participantData.name;
    const studentId = isUserInstructor ? participantId : userId;
    const studentName = isUserInstructor ? participantData.name : userData.name;

    const conversationId = db.collection(this.conversationsCollection).doc().id;
    const conversation: Conversation = {
      id: conversationId,
      participants: {
        instructorId,
        instructorName,
        studentId,
        studentName,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db
      .collection(this.conversationsCollection)
      .doc(conversationId)
      .set(conversation);
    return conversation;
  }

  private async updateConversation(
    senderId: string,
    receiverId: string,
    message: Message,
  ): Promise<void> {
    const conversationQuery = await db
      .collection(this.conversationsCollection)
      .where("participants.instructorId", "in", [senderId, receiverId])
      .where("participants.studentId", "in", [senderId, receiverId])
      .limit(1)
      .get();

    if (!conversationQuery.empty) {
      const conversationDoc = conversationQuery.docs[0];
      await conversationDoc.ref.update({
        lastMessage: message,
        lastMessageAt: message.timestamp,
        updatedAt: new Date(),
      });
    }
  }
}
