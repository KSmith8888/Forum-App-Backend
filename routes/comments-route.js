import express from "express";

import {
    createComment,
    likeComment,
} from "../controllers/comments-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";
import { authorizeUser } from "../middleware/authorize.js";

const commentsRouter = express.Router();

commentsRouter.options("/create", optionsPreflight);
commentsRouter.post("/create", authorizeUser, createComment);
commentsRouter.options("/likes/:id", optionsPreflight);
commentsRouter.patch("/likes/:id", authorizeUser, likeComment);

export { commentsRouter };
