import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes";
import instructorRoutes from "./modules/instructor/instructor.routes";
import studentRoutes from "./modules/student/student.routes";
import studentAuthRoutes from "./modules/student/student-auth.routes";
import chatRoutes from "./modules/chat/chat.routes";
import { errorHandler } from "./shared/middleware/error.middleware";

const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL || "http://localhost:5173"]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/student-auth", studentAuthRoutes);
app.use("/api/chat", chatRoutes);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use(errorHandler);

export default app;
