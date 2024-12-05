import { wrapper } from "../wrapper.js";
import { Comment } from "../../models/comment-model.js";
import { Post } from "../../models/post-model.js";
import { User } from "../../models/user-model.js";
import { Notification } from "../../models/notification-model.js";

export const createComment = wrapper(async (req, res) => {
    const content = req.body.content;
    const postId = req.body.postId;
    const commentId = req.body.commentId;
    const replyType = req.body.replyType;
    const postUrlTitle = req.body.postUrlTitle;
    if (!content || !postId || !replyType || !postUrlTitle) {
        throw new Error("Bad Request Error: Comment info not provided");
    }
    if (typeof content !== "string") {
        throw new Error("Bad Request Error: Invalid content provided");
    }
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (dbUser.comments.length > 300) {
        throw new Error("Limit Exceeded Error: Comment limit exceeded");
    }
    const isCommentReply = replyType === "comment" ? true : false;
    const preview =
        content.length <= 50 ? content : `${content.substring(0, 50)}...`;
    const dbComment = await Comment.create({
        content: String(content),
        previewText: String(preview),
        relatedPost: String(postId),
        postUrlTitle: String(postUrlTitle),
        commentReply: isCommentReply,
        user: dbUser.displayName,
        profileImageName: dbUser.profileImageName,
        profileImageAlt: dbUser.profileImageAlt,
    });
    const newComments = [
        {
            commentId: String(dbComment._id),
            previewText: String(preview),
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
    const newNotificationData = {
        message: `${dbUser.displayName} replied to your message`,
        type: "Reply",
        relatedPostId: String(postId),
        commentId: String(dbComment._id),
    };
    if (!isCommentReply && relatedPost.user !== "Deleted") {
        const replyUsername = relatedPost.user.toLowerCase();
        const userToBeNotified = await User.findOne({
            username: replyUsername,
        });
        if (
            dbComment.user.toLowerCase() !== relatedPost.user.toLowerCase() &&
            userToBeNotified.getReplyNotifications
        ) {
            const newNotification = await Notification.create(
                newNotificationData
            );
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
            const newNotification = await Notification.create(
                newNotificationData
            );
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
