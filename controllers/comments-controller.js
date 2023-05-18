import { wrapper } from "./wrapper.js";
import { Comment } from "../models/comment-model.js";
import { Post } from "../models/post-model.js";

const createComment = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const content = req.body.content;
    const postId = req.body.post;
    if (!content || !postId) {
        throw new Error("Bad Request Error: Content or post id not provided");
    }
    const dbComment = await Comment.create({
        content: content,
    });
    const dbPost = await Post.findOne({ _id: postId });
    await Post.findOneAndUpdate(
        { _id: postId },
        {
            $set: {
                comments: [...dbPost.comments, dbComment],
            },
        }
    );
    res.status(201);
    res.json(dbComment);
});

export { createComment };
