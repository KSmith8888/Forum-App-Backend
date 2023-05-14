import express from "express";

import {
    createPost,
    getPost,
    getPostsByTopic,
} from "../controllers/posts-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";
import { authorizeUser } from "../middleware/authorize.js";

const postsRouter = express.Router();

postsRouter.options("/create", optionsPreflight);
postsRouter.post("/create", authorizeUser, createPost);
postsRouter.get("/:topic", getPostsByTopic);
postsRouter.get("/details/:id", getPost);

export { postsRouter };
