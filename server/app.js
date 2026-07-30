import express from "express";
import routes from "./routes/index.js";
import cors from "cors";
import donten from "./"

const app = express();
app.use(
  cors({
    origin:process.env.CLIENT_URL || "http://localhost:5173",
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