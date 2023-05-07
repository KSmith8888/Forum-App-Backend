import dotenv from "dotenv";
dotenv.config();
import express from "express";

const app = express();

app.use(express.json());

const loginRouter = express.Router();

loginRouter.get("/", (req, res) => {
    res.status(200);
    res.json({ status: "Login successful" });
});

app.use("/api/v1/login", loginRouter);

export { app };
