import express from "express";
import routes from "./routes/index.js";
import cors from "cors";

const app = express();
const allowedOrigins = [
  "https://project-mgmnt-eta.vercel.app", // Deployed frontend
  "http://localhost:5173",                 // Local Vite frontend
  "http://localhost:3000",                 // Fallback dev port
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS policy"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// single mount point
app.use("/api", routes);

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running"
    });
});

export default app;