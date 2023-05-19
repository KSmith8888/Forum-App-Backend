import { wrapper } from "./wrapper.js";
import { Post } from "../models/post-model.js";
import { User } from "../models/user-model.js";

const createPost = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const topic = req.body.topic;
    const title = req.body.title;
    const content = req.body.content;
    const username = req.username;
    const keywords = req.body.keywords ? req.body.keywords.split(" ") : [];
    const allowedTopics = ["movies", "books", "games"];
    if (!allowedTopics.includes(topic)) {
        throw new Error("Bad Request Error: Topic not allowed");
    }
    if (!title || !content) {
        throw new Error("Bad Request Error: Title or content not provided");
    }
    const dbUser = await User.findOne({ _id: req.userId });
    const dbPost = await Post.create({
        title: title,
        content: content,
        topic: topic,
        user: username,
        keywords: keywords,
    });

    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                posts: [
                    ...dbUser.posts,
                    { id: dbPost._id, title: dbPost.title },
                ],
            },
        }
    );
    res.status(201);
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
    const requestedPost = await Post.find({ topic: String(postsTopic) }).limit(
        20
    );
    res.status(200);
    res.json(requestedPost);
});

const getPostsByUser = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const userId = req.params.id;
    const dbUser = await User.findOne({ _id: String(userId) });
    if (!dbUser) {
        throw new Error("No user account found, it may have been deleted");
    }
    const userPostIds = dbUser.posts;
    res.status(200);
    res.json(userPostIds);
});

const likePost = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const postId = req.params.id;
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (dbUser.likedPosts.includes(postId)) {
        throw new Error("You cannot like the same post more than once");
    }
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                likedPosts: [...dbUser.likedPosts, postId],
            },
        }
    );
    const dbPost = await Post.findOne({ _id: String(postId) });
    const numberOfLikes = dbPost.likes + 1;
    await Post.findOneAndUpdate(
        { _id: dbPost._id },
        {
            $set: {
                likes: numberOfLikes,
            },
        }
    );
    res.status(200);
    res.json({ status: "Post liked successfully" });
});

export { createPost, getPost, getPostsByTopic, getPostsByUser, likePost };
