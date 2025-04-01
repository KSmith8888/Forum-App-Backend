import express from "express";

import { optionsPreflight } from "../controllers/options-preflight.js";
import { getComment } from "../controllers/comment-controllers/get-comment.js";
import { createComment } from "../controllers/comment-controllers/create-comment.js";
import { likeComment } from "../controllers/comment-controllers/like-comment.js";
import { editComment } from "../controllers/comment-controllers/edit-comment.js";
import { deleteComment } from "../controllers/comment-controllers/delete-comment.js";
import { authorizeUser } from "../middleware/authorize.js";
import { sanitizeChars } from "../middleware/sanitize.js";
import { checkIfBanned } from "../middleware/ban-status.js";

const commentsRouter = express.Router();

commentsRouter.options("/*wildcard", optionsPreflight);
commentsRouter.get("/:id", sanitizeChars, getComment);
commentsRouter.post(
    "/create",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    createComment
);
commentsRouter.patch(
    "/likes/:id",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    likeComment
);
commentsRouter.patch(
    "/:id",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    editComment
);
commentsRouter.delete("/:id", sanitizeChars, authorizeUser, deleteComment);

export { commentsRouter };
