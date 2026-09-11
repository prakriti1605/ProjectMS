import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { setSocketServer } from "./utils/socket.js";

const PORT = process.env.PORT || 8002;

connectDB().then(() => {
  const server = http.createServer(app);
  setSocketServer(server);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});