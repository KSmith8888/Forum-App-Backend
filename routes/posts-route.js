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

const postsRouter = express.Router();

postsRouter.options("*", optionsPreflight);
postsRouter.post("/create", authorizeUser, createPost);
postsRouter.patch("/likes/:id", authorizeUser, likePost);
postsRouter.get("/popular", getPostsByLikes);
postsRouter.get("/:topic", getPostsByTopic);
postsRouter.get("/details/:id", getPost);
postsRouter.get("/user/:id", getPostsByUser);
postsRouter.get("/search/:query", getPostsByQuery);
postsRouter.patch("/details/:id", authorizeUser, editPost);
postsRouter.delete("/details/:id", authorizeUser, deletePost);

export { postsRouter };
