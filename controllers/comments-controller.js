import { wrapper } from "./wrapper.js";
import { Comment } from "../models/comment-model.js";
import { Post } from "../models/post-model.js";
import { User } from "../models/user-model.js";

const createComment = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const content = req.body.content;
    const postId = req.body.postId;
    if (!content || !postId) {
        throw new Error("Bad Request Error: Content or post id not provided");
    }
    const dbComment = await Comment.create({
        content: content,
        relatedPost: postId,
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

const likeComment = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const commentId = req.params.id;
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (dbUser.likedComments.includes(commentId)) {
        throw new Error("You cannot like the same comment more than once");
    }
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                likedComments: [...dbUser.likedComments, commentId],
            },
        }
    );
    const dbComment = await Post.findOne({ _id: String(commentId) });
    const numberOfLikes = dbComment.likes + 1;
    await Post.findOneAndUpdate(
        { _id: dbComment._id },
        {
            $set: {
                likes: numberOfLikes,
            },
        }
    );
    res.status(200);
    res.json({ status: "Comment liked successfully", likes: numberOfLikes });
});

export { createComment, likeComment };
