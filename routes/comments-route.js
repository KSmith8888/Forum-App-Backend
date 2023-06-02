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
import { sanitizeChars } from "../middleware/sanitize.js";

const commentsRouter = express.Router();

commentsRouter.options("*", optionsPreflight);
commentsRouter.get("/details/:id", sanitizeChars, getComment);
commentsRouter.post("/create", sanitizeChars, authorizeUser, createComment);
commentsRouter.patch("/likes/:id", sanitizeChars, authorizeUser, likeComment);
commentsRouter.patch("/details/:id", sanitizeChars, authorizeUser, editComment);
commentsRouter.delete(
    "/details/:id",
    sanitizeChars,
    authorizeUser,
    deleteComment
);

export { commentsRouter };
