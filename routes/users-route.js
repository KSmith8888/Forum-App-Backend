import express from "express";

import { optionsPreflight } from "../controllers/options-preflight.js";
import { createNewUser } from "../controllers/users-controller.js";

const usersRouter = express.Router();

usersRouter.options("/", optionsPreflight);
usersRouter.post("/", createNewUser);

export { usersRouter };
