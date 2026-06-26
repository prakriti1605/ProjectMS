import express from "express";
import routes from "./routes/index.js";

const app = express();

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