import { wrapper } from "./wrapper.js";
import { Comment } from "../models/comment-model.js";
import { Post } from "../models/post-model.js";
import { User } from "../models/user-model.js";
import { Notification } from "../models/notification-model.js";

const createComment = wrapper(async (req, res) => {
    const content = req.body.content;
    const postId = req.body.postId;
    const commentId = req.body.commentId;
    const replyType = req.body.replyType;
    if (!content || !postId || !replyType) {
        throw new Error("Bad Request Error: Content or post id not provided");
    }
    if (typeof content !== "string") {
        throw new Error("Bad Request Error: Invalid content provided");
    }
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (dbUser.comments.length > 300) {
        throw new Error("Limit Exceeded Error: Comment limit exceeded");
    }
    const isCommentReply = replyType === "comment" ? true : false;
    const dbComment = await Comment.create({
        content: String(content),
        relatedPost: String(postId),
        commentReply: isCommentReply,
        user: dbUser.displayName,
        profileImageName: dbUser.profileImageName,
        profileImageAlt: dbUser.profileImageAlt,
    });
    const newComments = [
        {
            commentId: String(dbComment._id),
            content: dbComment.content,
            relatedPost: dbComment.relatedPost,
        },
        ...dbUser.comments,
    ];
    await User.findOneAndUpdate(
        { _id: req.userId },
        {
            $set: {
                comments: newComments,
            },
        }
    );
    const dbMessage = await Post.findOne({ _id: String(postId) });
    //Message is a top level comment on the post and is placed at the end of the comments
    let newPostComments = [...dbMessage.comments, dbComment._id];
    //Message is a nested reply to another comment and is placed just below the comment being replied to
    if (isCommentReply && commentId !== "none") {
        const commentIndex = dbMessage.comments.indexOf(commentId);
        if (commentIndex === -1) {
            throw new Error(
                "Bad Request Error: No comment id passed for reply"
            );
        }
        let newReplyComments = dbMessage.comments.slice(0, commentIndex + 1);
        newReplyComments.push(dbComment._id);
        let remainingComments = dbMessage.comments.splice(commentIndex + 1);
        newReplyComments.push(...remainingComments);
        newPostComments = newReplyComments;
    }
    const relatedPost = await Post.findOneAndUpdate(
        { _id: String(postId) },
        {
            $set: {
                comments: newPostComments,
            },
        }
    );
    const newNotification = await Notification.create({
        message: `${dbUser.displayName} replied to your message`,
        type: "Reply",
        replyMessageId: String(postId),
        commentId: String(dbComment._id),
    });
    if (!isCommentReply && relatedPost.user !== "Deleted") {
        const replyUsername = relatedPost.user.toLowerCase();
        const userToBeNotified = await User.findOne({
            username: replyUsername,
        });
        if (
            dbComment.user.toLowerCase() !== relatedPost.user.toLowerCase() &&
            userToBeNotified.getReplyNotifications
        ) {
            await User.findOneAndUpdate(
                { username: replyUsername },
                {
                    $set: {
                        notifications: [
                            ...userToBeNotified.notifications,
                            newNotification._id,
                        ],
                    },
                }
            );
        }
    } else if (isCommentReply && commentId !== "none") {
        const dbReplyComment = await Comment.findOne({
            _id: String(commentId),
        });
        const replyCommentUsername = dbReplyComment.user.toLowerCase();
        const userToBeNotified = await User.findOne({
            username: replyCommentUsername,
        });
        if (
            replyCommentUsername !== "deleted" &&
            replyCommentUsername !== dbComment.user.toLowerCase() &&
            userToBeNotified.getReplyNotifications
        ) {
            await User.findOneAndUpdate(
                { username: replyCommentUsername },
                {
                    $set: {
                        notifications: [
                            ...userToBeNotified.notifications,
                            newNotification._id,
                        ],
                    },
                }
            );
        }
    }

    res.status(201);
    res.json(relatedPost.comments);
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
        commentLikes: numberOfLikes,
        didLikeComment: didUserLike,
        likeCommentId: req.params.id,
    });
});

const editComment = wrapper(async (req, res) => {
    const commentId = req.params.id;
    if (typeof commentId !== "string") {
        throw new Error("Bad Request Error: Invalid comment id type provided");
    }
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const userCommentIds = dbUser.comments.map((comment) => {
        return String(comment.commentId);
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
    const dbComment = await Comment.findOne({ _id: String(commentId) });
    if (dbComment.history.length > 5) {
        throw new Error("Maximum number of edits reached");
    }
    const prevContent = dbComment.content;
    const prevTimestamp =
        dbComment.createdAt !== dbComment.updatedAt
            ? dbComment.updatedAt
            : dbComment.createdAt;
    const prevComment = {
        content: prevContent,
        timestamp: prevTimestamp,
        editNumber: dbComment.history.length + 1,
    };
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
    const newUserComments = dbUser.comments.map((comment) => {
        if (String(comment.commentId) === commentId) {
            return {
                commentId: comment.commentId,
                content: newContent,
                relatedPost: comment.relatedPost,
            };
        } else {
            return comment;
        }
    });
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
        {
            $set: {
                comments: newUserComments,
            },
        }
    );
    res.status(200);
    res.json({ relatedPostId: dbComment.relatedPost });
});

const deleteComment = wrapper(async (req, res) => {
    const commentId = req.params.id;
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const userCommentIds = dbUser.comments.map((comment) => {
        return String(comment.commentId);
    });
    if (!userCommentIds.includes(commentId)) {
        throw new Error("Users can only delete their own comments");
    }
    const newUserComments = dbUser.comments.filter((comment) => {
        return String(comment.commentId) !== commentId;
    });
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
        {
            $set: {
                comments: newUserComments,
            },
        }
    );
    await Comment.findOneAndUpdate(
        { _id: String(commentId) },
        {
            $set: {
                user: "Deleted",
                content: "This comment has been deleted",
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            },
        }
    );
    res.status(200);
    res.json({
        message: `Comment deleted successfully-Target ID-${commentId}`,
    });
});

export { createComment, getComment, likeComment, editComment, deleteComment };
