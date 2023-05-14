import express from "express";

import { createNewUser } from "../controllers/users-controller.js";

const usersRouter = express.Router();

usersRouter.options("/", optionsPreflight);
usersRouter.post("/", createNewUser);

export { usersRouter };
