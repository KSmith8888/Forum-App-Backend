import dotenv from "dotenv";
dotenv.config();
import express from "express";
import rateLimit from "express-rate-limit";

import { loginRouter } from "./routes/login-route.js";
import { postsRouter } from "./routes/posts-route.js";
import { usersRouter } from "./routes/users-route.js";
import { commentsRouter } from "./routes/comments-route.js";

const limitErrorMsg = JSON.stringify({
    msg: "Too many requests, please try again later",
});

const limiter = rateLimit({
    windowMs: 60000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: limitErrorMsg,
});

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    next();
});

app.use(limiter);
app.use(express.json());

app.use("/api/v1/login", loginRouter);
app.use("/api/v1/posts", postsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("*", (req, res) => {
    res.status(404);
    res.json({ msg: "The requested resource does not exist" });
});

export { app };
