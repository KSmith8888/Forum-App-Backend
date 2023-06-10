import mongoose from "mongoose";

import { wrapper } from "./wrapper.js";
import { Comment } from "../models/comment-model.js";
import { Post } from "../models/post-model.js";
import { User } from "../models/user-model.js";

const createComment = wrapper(async (req, res) => {
    const content = req.body.content;
    const postId = req.body.postId;
    if (!content || !postId) {
        throw new Error("Bad Request Error: Content or post id not provided");
    }
    if (typeof content !== "string" || typeof postId !== "string") {
        throw new Error(
            "Bad Request Error: Invalid content or post id type provided"
        );
    }
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const dbComment = await Comment.create({
        content: content,
        relatedPost: postId,
        user: dbUser.displayName,
        profileImageName: dbUser.profileImageName,
        profileImageAlt: dbUser.profileImageAlt,
    });
    const newComments = [...dbUser.comments, dbComment._id];
    await User.findOneAndUpdate(
        { _id: req.userId },
        {
            $set: {
                comments: newComments,
            },
        }
    );
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

const getComment = wrapper(async (req, res) => {
    const commentId = req.params.id;
    const requestedComment = await Comment.findOne({ _id: String(commentId) });
    if (!requestedComment) {
        throw new Error(
            "Not Found Error: No comment found with that id, it may have been deleted"
        );
    }
    res.status(200);
    res.json(requestedComment);
});

const likeComment = wrapper(async (req, res) => {
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
    await Post.findOneAndUpdate(
        { _id: dbPost._id },
        {
            $set: {
                comments: newPostComments,
            },
        }
    );
    res.status(200);
    res.json({
        status: "Comment liked successfully",
        likes: numberOfLikes,
        didUserLike,
    });
});

const editComment = wrapper(async (req, res) => {
    const commentId = req.params.id;
    if (typeof commentId !== "string") {
        throw new Error("Bad Request Error: Invalid comment id type provided");
    }
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const userCommentIds = dbUser.comments.map((id) => {
        return String(id);
    });
    if (!userCommentIds.includes(commentId)) {
        throw new Error("Users can only edit their own comments");
    }
    const newContent = req.body.content;
    if (!newContent) {
        throw new Error("Updated content not provided");
    }
    if (typeof newContent !== "string") {
        throw new Error("Bad Request Error: Invalid content type provided");
    }
    const dbComment = await Comment.findOne({ _id: commentId });
    const prevContent = dbComment.content;
    const prevTimestamp =
        dbComment.createdAt !== dbComment.updatedAt
            ? dbComment.updatedAt
            : dbComment.createdAt;
    const prevComment = { content: prevContent, timestamp: prevTimestamp };
    const prevHistory = dbComment.history || [];
    await Comment.findOneAndUpdate(
        { _id: dbComment._id },
        {
            $set: {
                content: newContent,
                hasBeenEdited: true,
                history: [...prevHistory, prevComment],
            },
        }
    );
    res.status(200);
    res.json({ relatedPostId: dbComment.relatedPost });
});

const deleteComment = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const commentId = req.params.id;
    const dbComment = await Comment.findOne({ _id: commentId });
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const userCommentIds = dbUser.comments.map((id) => {
        return String(id);
    });
    if (!userCommentIds.includes(commentId)) {
        throw new Error("Users can only edit their own comments");
    }
    const newUserComments = dbUser.comments.filter((id) => {
        return String(id) !== commentId;
    });
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
        {
            $set: {
                comments: newUserComments,
            },
        }
    );
    const relatedPost = await Post.findOne({ _id: dbComment.relatedPost });
    const newPostComments = relatedPost.comments.filter((id) => {
        return id !== commentId;
    });
    await Post.findOneAndUpdate(
        { _id: relatedPost._id },
        {
            $set: {
                comments: newPostComments,
            },
        }
    );
    await Comment.findByIdAndDelete({ _id: commentId });
    res.status(200);
    res.json({ message: "Comment deleted successfully" });
});

export { createComment, getComment, likeComment, editComment, deleteComment };
