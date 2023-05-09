import express from "express";

import { loginOptions, attemptLogin } from "../controllers/login-controller";

const loginRouter = express.Router();

loginRouter.options("/", loginOptions);
loginRouter.post("/", attemptLogin);

export { loginRouter };
