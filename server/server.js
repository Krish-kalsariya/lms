import express from "express";
import dotenv from "dotenv";
dotenv.config(); 
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cookieParser from "cookie-parser";
import connectDB from "./confing/conn.js"; 
import userRoute from "./routes/user.routes.js";
import courseRoute from "./routes/course.routes.js";
import courseProgressRoute from "./routes/courseProgress.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import notesRoutes from "./routes/note.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import reviewRoute from "./routes/review.routes.js"; 
import quizRoute from "./routes/quiz.routes.js";
import statusRoute from "./routes/status.routes.js";
import "./confing/passport.js"; // passport config


// DB Connection
connectDB();

const app = express();

// Trust proxy for Render / cloud load balancers (required for cookies & HTTPS)
app.set("trust proxy", 1);

/* MIDDLEWARES */

app.use(express.json());
app.use(cookieParser());

// CORS CONFIG
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://lms-bay-iota.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      const isAllowed =
        allowedOrigins.some((o) => o.replace(/\/+$/, "") === cleanOrigin) ||
        cleanOrigin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production";

      if (isAllowed) {
        return callback(null, origin);
      }
      return callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// session
const isProdEnvironment =
  process.env.NODE_ENV === "production" ||
  process.env.RENDER === "true" ||
  (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes("localhost"));

app.use(
  session({
    name: "Brainera-session",
    secret: process.env.SESSION_SECRET || "brainera_default_secret",
    resave: false,
    saveUninitialized: false,

    rolling: true, // Auto-extend on activity

    store: MongoStore.create({
      mongoUrl: process.env.URL,
      ttl: 60 * 60 * 24, // 24 hours (in seconds)
    }),

    cookie: {
      httpOnly: true,
      secure: isProdEnvironment,
      sameSite: isProdEnvironment ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours (in milliseconds)
    },
  })
);




/* PASSPORT MIDDLEWARE */

app.use(passport.initialize());
app.use(passport.session());

/* ROUTES */

app.use("/api/v1/users", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/certificate", certificateRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/quiz",  quizRoute);
app.use("/status", statusRoute);


/* SERVER LISTENING */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});