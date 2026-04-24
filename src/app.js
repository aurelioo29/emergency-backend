const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");
const { sendSuccess } = require("./utils/response");

const app = express();

const uploadsPath = path.resolve(process.cwd(), "uploads");
console.log("Serving uploads from:", uploadsPath);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/uploads", express.static(uploadsPath));

app.get("/health", (req, res) => {
  return sendSuccess(res, {
    message: "Emergency backend is running",
    data: null,
  });
});

app.use("/api", routes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorMiddleware);

module.exports = app;
