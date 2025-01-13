import express from "express";

import { createPost } from "../controllers/post-controllers/create-post.js";
import { getPost } from "../controllers/post-controllers/get-post.js";
import { getPostsByTopic } from "../controllers/post-controllers/get-posts-by-topic.js";
import { getPostsByQuery } from "../controllers/post-controllers/get-posts-by-query.js";
import { getHomePosts } from "../controllers/post-controllers/get-home-posts.js";
import { likePost } from "../controllers/post-controllers/like-post.js";
import { savePost } from "../controllers/post-controllers/save-post.js";
import { voteInPoll } from "../controllers/post-controllers/vote-in-poll.js";
import { editPost } from "../controllers/post-controllers/edit-post.js";
import { deletePost } from "../controllers/post-controllers/delete-post.js";
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
postsRouter.patch(
    "/likes/:id",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    likePost
);
postsRouter.patch("/save/:id", sanitizeChars, authorizeUser, savePost);
postsRouter.patch(
    "/vote/:id",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    voteInPoll
);
postsRouter.patch(
    "/:id",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    editPost
);
postsRouter.delete("/:id", sanitizeChars, authorizeUser, deletePost);

export { postsRouter };
