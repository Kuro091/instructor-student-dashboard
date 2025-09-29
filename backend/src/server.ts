import dotenv from "dotenv";
import { createServer } from "http";

dotenv.config();

import app from "./app";
import { SocketService } from "./shared/socket/socket.service";

const PORT = process.env.PORT || 5000;

const server = createServer(app);

new SocketService(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server initialized`);
});
