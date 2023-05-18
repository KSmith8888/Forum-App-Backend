import express from "express";

import { createComment } from "../controllers/comments-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";
import { authorizeUser } from "../middleware/authorize.js";

const commentsRouter = express.Router();

commentsRouter.options("/create", optionsPreflight);
commentsRouter.post("/create", authorizeUser, createComment);

export { commentsRouter };
