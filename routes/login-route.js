import express from "express";

import { attemptLogin } from "../controllers/login-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";

const loginRouter = express.Router();

loginRouter.options("/", optionsPreflight);
loginRouter.post("/", attemptLogin);

export { loginRouter };
