const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // Attach io to global so Next.js route handlers can access it
  global.io = io;

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on("sync:request", () => {
      socket.emit("sync:acknowledged", { timestamp: Date.now() });
    });

    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  httpServer.once("error", (err) => {
    console.error("[Socket.IO] Server error:", err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> PatelEsp Tournament Server ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO real-time WebSocket server active on /socket.io`);
  });
}).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
