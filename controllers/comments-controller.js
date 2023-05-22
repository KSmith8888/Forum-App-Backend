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
                comments: [...dbPost.comments, dbComment._id],
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
    //Did user like comment or unlike
    let didUserLike = true;
    let newLikedComments = [];
    if (dbUser.likedComments.includes(commentId)) {
        didUserLike = false;
        newLikedComments = dbUser.likedComments.filter((id) => {
            return id !== commentId;
        });
    } else {
        newLikedComments = [...dbUser.likedComments, commentId];
    }
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                likedComments: newLikedComments,
            },
        }
    );
    const dbComment = await Comment.findOne({ _id: String(commentId) });
    const numberOfLikes = didUserLike
        ? dbComment.likes + 1
        : dbComment.likes - 1;
    const newComment = await Comment.findOneAndUpdate(
        { _id: dbComment._id },
        {
            $set: {
                likes: numberOfLikes,
            },
        }
    );
    const dbPost = await Post.findOne({ _id: dbComment.relatedPost });
    const newPostComments = dbPost.comments.map((comment) => {
        if (comment._id !== commentId) {
            return comment;
        } else {
            return newComment;
        }
    });
    console.log(newPostComments);
    await Post.findOneAndUpdate(
        { _id: dbPost._id },
        {
            $set: {
                comments: newPostComments,
            },
        }
    );
    dbPost.save();
    res.status(200);
    res.json({
        status: "Comment liked successfully",
        likes: numberOfLikes,
        didUserLike,
    });
});

export { createComment, likeComment };
