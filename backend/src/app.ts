import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./shared/middleware/error.middleware";

dotenv.config();

const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? false : ["http://localhost:5173"],
    credentials: true,
  }),
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use(errorHandler);

export default app;
