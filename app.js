import dotenv from "dotenv";
dotenv.config();
import express from "express";

import { loginRouter } from "./routes/login-route.js";

const app = express();

app.use(express.json());

app.use("/api/v1/login", loginRouter);
app.use("*", (req, res) => {
    res.status(200);
    res.json({ message: "Page not found" });
});

export { app };
