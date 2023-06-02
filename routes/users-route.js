import express from "express";

import { optionsPreflight } from "../controllers/options-preflight.js";
import { createNewUser } from "../controllers/users-controller.js";
import { sanitizeChars } from "../middleware/sanitize.js";

const usersRouter = express.Router();

usersRouter.options("*", optionsPreflight);
usersRouter.post("/", sanitizeChars, createNewUser);

export { usersRouter };
