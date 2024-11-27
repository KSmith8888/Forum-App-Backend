import express from "express";

import {
    createPost,
    getPost,
    getHomePosts,
    getPostsByTopic,
    likePost,
    savePost,
    getPostsByQuery,
    editPost,
    deletePost,
} from "../controllers/posts-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";
import { authorizeUser } from "../middleware/authorize.js";
import { sanitizeChars } from "../middleware/sanitize.js";
import { checkIfBanned } from "../middleware/ban-status.js";

const postsRouter = express.Router();

postsRouter.options("*", optionsPreflight);
postsRouter.get("/home/", getHomePosts);
postsRouter.get("/topics/:topic", sanitizeChars, getPostsByTopic);
postsRouter.get("/search/:query", sanitizeChars, getPostsByQuery);
postsRouter.get("/:id", sanitizeChars, getPost);
postsRouter.post(
    "/create",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    createPost
);
postsRouter.patch("/likes/:id", sanitizeChars, authorizeUser, likePost);
postsRouter.patch("/save/:id", sanitizeChars, authorizeUser, savePost);
postsRouter.patch(
    "/:id",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    editPost
);
postsRouter.delete("/:id", sanitizeChars, authorizeUser, deletePost);

export { postsRouter };
