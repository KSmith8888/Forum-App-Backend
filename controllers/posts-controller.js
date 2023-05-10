import { wrapper } from "./wrapper.js";
import { Post } from "../models/post-model.js";

const createPost = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const topic = req.body.topic;
    const title = req.body.title;
    const content = req.body.content;
    const allowedTopics = ["Movies", "Books", "Games"];
    if (!allowedTopics.includes(topic)) {
        throw new Error("Bad Request Error: Topic not allowed");
    }
    if (!title || !content) {
        throw new Error("Bad Request Error: Title or content not provided");
    }
    //TODO: Put the _id of the post in the posts array for that user
    const dbPost = await Post.create({
        title: title,
        content: content,
        topic: topic,
    });
    res.status(200);
    res.json(dbPost);
});

const getPost = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const postId = req.params.id;
    const requestedPost = await Post.findOne({ _id: String(postId) });
    if (!requestedPost) {
        throw new Error(
            "Not Found Error: No post found with that id, it may have been deleted"
        );
    }
    res.status(200);
    res.json(requestedPost);
});

const getPostsByTopic = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const postsTopic = req.params.topic;
    const requestedPost = await Post.find({ topic: String(postsTopic) });
    res.status(200);
    res.json(requestedPost);
});

export { createPost, getPost, getPostsByTopic };
