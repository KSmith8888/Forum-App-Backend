import express from "express";

import {
    createPost,
    getPost,
    getPostsByLikes,
    getPostsByTopic,
    getPostsByUser,
    likePost,
    getPostsByQuery,
    editPost,
    deletePost,
} from "../controllers/posts-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";
import { authorizeUser } from "../middleware/authorize.js";
import { sanitizeChars } from "../middleware/sanitize.js";

const postsRouter = express.Router();

postsRouter.options("*", optionsPreflight);
postsRouter.post("/create", sanitizeChars, authorizeUser, createPost);
postsRouter.patch("/likes/:id", sanitizeChars, authorizeUser, likePost);
postsRouter.get("/popular", getPostsByLikes);
postsRouter.get("/:topic", sanitizeChars, getPostsByTopic);
postsRouter.get("/details/:id", sanitizeChars, getPost);
postsRouter.get("/user/:id", sanitizeChars, getPostsByUser);
postsRouter.get("/search/:query", sanitizeChars, getPostsByQuery);
postsRouter.patch("/details/:id", sanitizeChars, authorizeUser, editPost);
postsRouter.delete("/details/:id", sanitizeChars, authorizeUser, deletePost);

export { postsRouter };
