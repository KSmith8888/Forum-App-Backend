import express from "express";

import {
    createPost,
    getPost,
    getPostsByTopic,
} from "../controllers/posts-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";

const postsRouter = express.Router();

postsRouter.options("/create", optionsPreflight);
postsRouter.post("/create", createPost);
postsRouter.get("/:topic", getPostsByTopic);
postsRouter.get("/details/:id", getPost);

export { postsRouter };
