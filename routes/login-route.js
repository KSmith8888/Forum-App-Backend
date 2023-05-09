import express from "express";

import { attemptLogin } from "../controllers/login-controller";
import { optionsPreflight } from "../controllers/options-preflight";

const loginRouter = express.Router();

loginRouter.options("/", optionsPreflight);
loginRouter.post("/", attemptLogin);

export { loginRouter };
