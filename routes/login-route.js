import express from "express";

import { attemptLogin } from "../controllers/login-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";
import { sanitizeChars } from "../middleware/sanitize.js";

const loginRouter = express.Router();

loginRouter.options("/", optionsPreflight);
loginRouter.post("/", sanitizeChars, attemptLogin);

export { loginRouter };
