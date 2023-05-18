import express from "express";

import {
    createPost,
    getPost,
    getPostsByTopic,
    getPostsByUser,
    likePost,
} from "../controllers/posts-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";
import { authorizeUser } from "../middleware/authorize.js";

const postsRouter = express.Router();

postsRouter.options("/create", optionsPreflight);
postsRouter.post("/create", authorizeUser, createPost);
postsRouter.options("/likes/:id", optionsPreflight);
postsRouter.patch("/likes/:id", authorizeUser, likePost);
postsRouter.get("/:topic", getPostsByTopic);
postsRouter.get("/details/:id", getPost);
postsRouter.get("/user/:id", getPostsByUser);

export { postsRouter };
