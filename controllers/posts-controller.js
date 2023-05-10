import { wrapper } from "./wrapper.js";

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
    const _id = "1337";
    const time = new Date();
    res.status(200);
    res.json({ topic, title, content, _id, time });
});

export { createPost };
