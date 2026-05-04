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

const normalizeOrigin = (origin) => {
  if (!origin) return "";
  return origin.replace(/\/$/, "");
};

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:7001",
  "http://147.93.81.243:7001",
  "https://alerta.project-mahadatatech.web.id",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_DOMAIN,
]
  .filter(Boolean)
  .map(normalizeOrigin);

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server, Postman, mobile apps, curl, etc.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Optional. Aman untuk Express/router baru.
app.options(/.*/, cors(corsOptions));

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
