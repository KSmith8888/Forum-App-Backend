import express from "express";

import {
    createComment,
    getComment,
    likeComment,
    editComment,
    deleteComment,
} from "../controllers/comments-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";
import { authorizeUser } from "../middleware/authorize.js";

const commentsRouter = express.Router();

commentsRouter.options("*", optionsPreflight);
commentsRouter.get("/details/:id", getComment);
commentsRouter.post("/create", authorizeUser, createComment);
commentsRouter.patch("/likes/:id", authorizeUser, likeComment);
commentsRouter.patch("/details/:id", authorizeUser, editComment);
commentsRouter.delete("/details/:id", authorizeUser, deleteComment);

export { commentsRouter };
