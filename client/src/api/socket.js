import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8002"
  : "https://project-mgmnt-eu2f.onrender.com";

console.log("🚀 SOCKET CLIENT INITIALIZING");
console.log("🌐 SOCKET URL:", SOCKET_URL);

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  withCredentials: true,
});

// --------------------------------------------------
// CONNECT
// --------------------------------------------------

socket.on("connect", () => {
  console.log("\n🟢 ===============================");
  console.log("🟢 CLIENT SOCKET CONNECTED");
  console.log("🟢 Socket ID:", socket.id);
  console.log("🟢 Connected:", socket.connected);
  console.log("🟢 ===============================\n");

  const activeOrgId = socket._activeOrgId;

  console.log("🏠 Active organisation:", activeOrgId);

  if (activeOrgId) {
    console.log(
      "📤 CLIENT SENDING JOIN ORGANISATION:",
      activeOrgId
    );

    socket.emit("join-organisation", {
      orgId: activeOrgId,
    });
  } else {
    console.log(
      "⚠️ No active organisation to join"
    );
  }
});

// --------------------------------------------------
// DISCONNECT
// --------------------------------------------------

socket.on("disconnect", (reason) => {
  console.log("\n🔴 ===============================");
  console.log("🔴 CLIENT SOCKET DISCONNECTED");
  console.log("🔴 Reason:", reason);
  console.log("🔴 ===============================\n");
});

// --------------------------------------------------
// CONNECTION ERROR
// --------------------------------------------------

socket.on("connect_error", (error) => {
  console.error("\n❌ ===============================");
  console.error("❌ CLIENT SOCKET CONNECTION ERROR");
  console.error("❌ Message:", error.message);
  console.error("❌ Error:", error);
  console.error("===============================\n");
});

// --------------------------------------------------
// RECONNECT ATTEMPT
// --------------------------------------------------

socket.io.on("reconnect_attempt", (attempt) => {
  console.log(
    "🔄 SOCKET RECONNECT ATTEMPT:",
    attempt
  );
});

// --------------------------------------------------
// RECONNECT
// --------------------------------------------------

socket.io.on("reconnect", (attempt) => {
  console.log(
    "🟢 SOCKET RECONNECTED",
    attempt
  );
});

// --------------------------------------------------
// CONNECT SOCKET
// --------------------------------------------------

export const connectSocket = (token, orgId) => {
  console.log("\n🔌 ===============================");
  console.log("🔌 connectSocket() CALLED");
  console.log("🔌 ===============================");

  console.log({
    hasToken: Boolean(token),
    orgId,
    currentSocketId: socket.id,
    connected: socket.connected,
  });

  if (!token) {
    console.log("❌ connectSocket aborted: no token");
    return;
  }

  socket._activeOrgId =
    orgId ||
    socket._activeOrgId ||
    null;

  socket.auth = {
    token,
  };

  console.log("🔑 Socket auth configured");
  console.log(
    "🏠 Active organisation:",
    socket._activeOrgId
  );

  if (!socket.connected) {
    console.log("📡 Calling socket.connect()");

    socket.connect();

    return;
  }

  console.log(
    "ℹ️ Socket already connected"
  );

  if (orgId) {
    console.log(
      "📤 Sending organisation join:",
      orgId
    );

    socket.emit("join-organisation", {
      orgId,
    });
  }
};

// --------------------------------------------------
// DISCONNECT SOCKET
// --------------------------------------------------

export const disconnectSocket = () => {
  console.log("\n🔌 disconnectSocket() CALLED");

  console.log({
    socketId: socket.id,
    connected: socket.connected,
    activeOrgId: socket._activeOrgId,
  });

  if (socket.connected) {
    socket.disconnect();

    console.log(
      "🔴 socket.disconnect() executed"
    );
  }

  socket._activeOrgId = null;

  console.log(
    "🧹 Active organisation cleared"
  );
};

// --------------------------------------------------
// LEAVE ORGANISATION
// --------------------------------------------------

export const leaveOrganisationSocket = (orgId) => {
  console.log(
    "\n🚪 leaveOrganisationSocket() CALLED",
    orgId
  );

  if (!orgId) {
    console.log(
      "❌ Leave aborted: no orgId"
    );

    return;
  }

  if (!socket.connected) {
    console.log(
      "❌ Leave aborted: socket disconnected"
    );

    return;
  }

  console.log(
    "📤 Sending leave-organisation:",
    orgId
  );

  socket.emit("leave-organisation", {
    orgId,
  });

  if (socket._activeOrgId === orgId) {
    socket._activeOrgId = null;

    console.log(
      "🧹 Active organisation cleared"
    );
  }
};