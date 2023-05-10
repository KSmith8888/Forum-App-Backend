import express from "express";

import { createPost } from "../controllers/posts-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";

const postsRouter = express.Router();

postsRouter.options("/create", optionsPreflight);
postsRouter.post("/create", createPost);

export { postsRouter };
