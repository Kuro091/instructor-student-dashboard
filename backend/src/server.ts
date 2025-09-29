import dotenv from "dotenv";
import { createServer } from "http";

dotenv.config();

import app from "./app";
import { SocketService } from "./shared/socket/socket.service";

const PORT = process.env.PORT || 5000;

const server = createServer(app);

new SocketService(server);

const findAvailablePort = (startPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const testServer = createServer();

    testServer.listen(startPort, () => {
      const port = (testServer.address() as any)?.port;
      testServer.close(() => resolve(port));
    });

    testServer.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        findAvailablePort(startPort + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

const startServer = async () => {
  try {
    const availablePort = await findAvailablePort(Number(PORT));

    server.listen(availablePort, () => {
      console.log(`Server running on port ${availablePort}`);
      console.log(`Socket.io server initialized`);
      console.log(
        `Frontend should connect to: http://localhost:${availablePort}`,
      );
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${availablePort} is in use, trying next port...`);
        startServer();
      } else {
        console.error("Server error:", err);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
