import dotenv from "dotenv";
dotenv.config();
import express from "express";

import { loginRouter } from "./routes/login-route.js";
import { postsRouter } from "./routes/posts-route.js";
import { usersRouter } from "./routes/users-route.js";
import { commentsRouter } from "./routes/comments-route.js";

const app = express();

app.use(express.json());

app.use("/api/v1/login", loginRouter);
app.use("/api/v1/posts", postsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("*", (req, res) => {
    res.status(200);
    res.json({ message: "Page not found" });
});

export { app };
