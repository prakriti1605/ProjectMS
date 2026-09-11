import jwt from "jsonwebtoken";
import { Server } from "socket.io";

const allowedOrigins = [
  "https://project-mgmnt-eta.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
];

let socketServer = null;

export const setSocketServer = (httpServer) => {
  if (socketServer) {
    console.log("⚠️ Socket.IO server already initialized");
    return socketServer;
  }

  console.log("🚀 Initializing Socket.IO server...");

  socketServer = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        console.log("🌐 Socket CORS origin:", origin);

        if (!origin || allowedOrigins.includes(origin)) {
          console.log("✅ Socket CORS allowed:", origin);
          return callback(null, true);
        }

        console.log("❌ Socket CORS blocked:", origin);
        return callback(new Error("Blocked by CORS policy"));
      },

      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  console.log("✅ Socket.IO server initialized");

  // --------------------------------------------------
  // SOCKET AUTHENTICATION
  // --------------------------------------------------

  socketServer.use((socket, next) => {
    console.log("\n🔐 SOCKET AUTHENTICATION START");

    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    console.log("🔑 Token received:", Boolean(token));

    if (!token) {
      console.log("❌ SOCKET AUTH FAILED: No token");

      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded;

      console.log("✅ SOCKET AUTH SUCCESS", {
        socketId: socket.id,
        userId: decoded._id || decoded.id || decoded.userId,
      });

      return next();
    } catch (error) {
      console.error("❌ SOCKET AUTH FAILED:", error.message);

      return next(new Error("Invalid or expired token"));
    }
  });

  // --------------------------------------------------
  // CONNECTION
  // --------------------------------------------------

  socketServer.on("connection", (socket) => {
    console.log("\n🟢 ===============================");
    console.log("🟢 SOCKET CONNECTED");
    console.log("🟢 Socket ID:", socket.id);
    console.log(
      "🟢 User ID:",
      socket.user?._id || socket.user?.id || socket.user?.userId
    );
    console.log("🟢 ===============================\n");

    // --------------------------------------------------
    // JOIN ORGANISATION
    // --------------------------------------------------

    socket.on("join-organisation", ({ orgId }) => {
      console.log("\n🏠 JOIN ORGANISATION REQUEST");

      console.log({
        socketId: socket.id,
        userId:
          socket.user?._id ||
          socket.user?.id ||
          socket.user?.userId,
        orgId,
      });

      if (!orgId || !socket.user) {
        console.log("❌ JOIN ORGANISATION REJECTED");

        return;
      }

      const room = `org:${orgId}`;

      socket.join(room);

      socket.data.orgId = orgId;

      console.log("✅ JOINED ORGANISATION ROOM");

      console.log({
        socketId: socket.id,
        room,
        orgId,
        userId:
          socket.user?._id ||
          socket.user?.id ||
          socket.user?.userId,
      });

      console.log(
        "📦 Current socket rooms:",
        [...socket.rooms]
      );
    });

    // --------------------------------------------------
    // LEAVE ORGANISATION
    // --------------------------------------------------

    socket.on("leave-organisation", ({ orgId }) => {
      console.log("\n🚪 LEAVE ORGANISATION REQUEST");

      console.log({
        socketId: socket.id,
        orgId,
      });

      if (!orgId) {
        console.log("❌ LEAVE REJECTED: No orgId");
        return;
      }

      const room = `org:${orgId}`;

      socket.leave(room);

      console.log("✅ LEFT ORGANISATION ROOM");

      console.log({
        socketId: socket.id,
        room,
      });

      if (socket.data.orgId === orgId) {
        delete socket.data.orgId;
      }

      console.log(
        "📦 Current socket rooms:",
        [...socket.rooms]
      );
    });

    // --------------------------------------------------
    // DISCONNECT
    // --------------------------------------------------

    socket.on("disconnect", (reason) => {
      console.log("\n🔴 ===============================");
      console.log("🔴 SOCKET DISCONNECTED");
      console.log("🔴 Socket ID:", socket.id);
      console.log("🔴 Reason:", reason);
      console.log("🔴 ===============================\n");
    });
  });

  return socketServer;
};

// --------------------------------------------------
// GET SOCKET SERVER
// --------------------------------------------------

export const getSocketServer = () => {
  console.log("🔎 getSocketServer called");

  return socketServer;
};

export const emitOrganisationEvent = ({ organisationId, event, payload = {} }) => {
  if (!socketServer || !organisationId) return;

  socketServer.to(`org:${organisationId}`).emit(event, {
    event,
    organisationId: organisationId.toString(),
    ...payload,
  });
};

// --------------------------------------------------
// EMIT TASK EVENT
// --------------------------------------------------

export const emitTaskEvent = ({
  organisationId,
  projectId,
  task,
  event,
}) => {
  console.log("\n📡 ===============================");
  console.log("📡 EMIT TASK EVENT");
  console.log("📡 ===============================");

  console.log({
    event,
    organisationId,
    projectId: projectId || task?.project,
    taskId: task?._id,
  });

  if (!socketServer) {
    console.log("❌ SOCKET EMISSION FAILED: socketServer is null");
    return;
  }

  if (!organisationId) {
    console.log("❌ SOCKET EMISSION FAILED: organisationId missing");
    return;
  }

  if (!task) {
    console.log("❌ SOCKET EMISSION FAILED: task missing");
    return;
  }

  const room = `org:${organisationId}`;

  console.log("📍 Target room:", room);

  const socketsInRoom = socketServer.sockets.adapter.rooms.get(room);

  console.log(
    "👥 Sockets currently in room:",
    socketsInRoom
      ? [...socketsInRoom]
      : []
  );

  console.log(
    "👥 Number of sockets in room:",
    socketsInRoom
      ? socketsInRoom.size
      : 0
  );

  const payload = {
    event,
    organisationId,
    projectId: projectId || task.project,
    task,
  };

  console.log("📦 Event payload:", payload);

  socketServer
    .to(room)
    .emit(event, payload);

  console.log("✅ SOCKET EVENT EMITTED");
  console.log("📡 Event:", event);
  console.log("📍 Room:", room);
  console.log("===============================\n");
};