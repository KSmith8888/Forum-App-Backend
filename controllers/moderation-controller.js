import mongoose from "mongoose";

import { wrapper } from "./wrapper.js";
import { Report } from "../models/report-model.js";
import { Post } from "../models/post-model.js";
import { Comment } from "../models/comment-model.js";
import { User } from "../models/user-model.js";

const getUserWarnings = wrapper(async (req, res) => {
    const role = req.role;
    if (role !== "mod" && role !== "admin") {
        throw new Error("You are not authorized to perform this action");
    }
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username: username });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
    }
    const userWarnings = dbUser.notifications.filter(
        (note) => note.type === "Warning"
    );
    res.status(200);
    res.json({ msg: "Notification sent successfully", warnings: userWarnings });
});

const sendUserNotification = wrapper(async (req, res) => {
    const role = req.role;
    if (role !== "mod" && role !== "admin") {
        throw new Error("You are not authorized to perform this action");
    }
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username: username });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
    }
    const notificationMsg = req.body.notificationMsg;
    const notificationType = req.body.isWarning ? "Warning" : "Notice";
    if (!notificationMsg || typeof notificationMsg !== "string") {
        throw new Error("Bad Request Error: Notification message not provided");
    }
    const notificationId = new mongoose.Types.ObjectId();
    const newNotification = {
        _id: String(notificationId),
        message: notificationMsg,
        type: notificationType,
        replyMessageId: "none",
        commentId: "none",
    };
    await User.findOneAndUpdate(
        { username: username },
        {
            $set: {
                notifications: [...dbUser.notifications, newNotification],
            },
        }
    );
    res.status(200);
    res.json({ msg: "Notification sent successfully" });
});

const banUser = wrapper(async (req, res) => {
    const bannedUser = req.body.banUser;
    const banTimestamp = req.body.banTimestamp;
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username: username });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
    }
    if (dbUser.role === "admin") {
        throw new Error("Bad Request Error: Not possible to ban an admin");
    }
    if (!bannedUser || !banTimestamp) {
        throw new Error("Bad Request Error: Ban info not provided");
    }
    await User.findOneAndUpdate(
        { username: username },
        {
            $set: {
                isBanned: true,
                endOfBan: banTimestamp,
            },
        }
    );
    res.status(201);
    res.json({ msg: "User banned successfully" });
});

const reportMessage = wrapper(async (req, res) => {
    if (!req.body.id || !req.body.type || !req.body.relatedPost) {
        throw new Error(
            "Bad Request Error: Reported message info not provided"
        );
    }
    await Report.create({
        messageId: String(req.body.id),
        messageType: String(req.body.type),
        reportedBy: String(req.username),
        relatedPost: String(req.body.relatedPost),
    });
    res.status(201);
    res.json({ msg: "Message reported successfully" });
});

const getReportedMessages = wrapper(async (req, res) => {
    if (req.role !== "mod" && req.role !== "admin") {
        throw new Error("User attempting to perform moderation action");
    }
    const oldestReports = await Report.find({})
        .sort({ createdAt: "asc" })
        .limit(10);
    res.status(200);
    res.json(oldestReports);
});

const changeAccountRole = wrapper(async (req, res) => {
    const newAccountRole = req.body.newRole;
    const accountUsername = req.params.username.toLowerCase();
    if (req.role !== "admin") {
        throw new Error(
            "Not Authorized Error: Attempt to create mod without admin access"
        );
    }
    if (!accountUsername || !newAccountRole) {
        throw new Error(
            "Bad Request Error: Account username or new role not provided"
        );
    }
    const dbAccount = await User.findOne({ username: String(accountUsername) });
    if (!dbAccount) {
        throw new Error("Not Found Error: That user does not exist");
    }
    await User.findOneAndUpdate(
        { username: String(accountUsername) },
        {
            $set: {
                role: String(newAccountRole),
            },
        }
    );
    res.status(200);
    res.json({
        msg: "Account role updated successfully",
    });
});

const deleteUsersPost = wrapper(async (req, res) => {
    const postId = req.params.id;
    if (!postId) {
        throw new Error("Bad Request Error: Post id not provided");
    }
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (req.role !== "mod" && req.role !== "admin") {
        throw new Error(
            "Not Authorized Error: User attempting to mod delete post"
        );
    }
    const dbPost = await Post.findOne({ _id: String(postId) });
    const postCreatorUsername = dbPost.user.toLowerCase();
    const newUserPosts = dbUser.posts.filter((postObj) => {
        return String(postObj.id) !== String(postId);
    });
    await User.findOneAndUpdate(
        {
            username: String(postCreatorUsername),
        },
        {
            $set: {
                posts: newUserPosts,
            },
        }
    );
    await Post.findOneAndUpdate(
        { _id: String(postId) },
        {
            $set: {
                user: "Deleted",
                postType: "Text",
                content: "This post has been deleted",
                keywords: [],
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            },
        }
    );
    res.status(200);
    res.json({ msg: "Post deleted successfully" });
});

const deleteUsersComment = wrapper(async (req, res) => {
    const commentId = req.params.id;
    if (!commentId) {
        throw new Error("Bad Request Error: Post id not provided");
    }
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (req.role !== "mod" && req.role !== "admin") {
        throw new Error(
            "Not Authorized Error: User attempting to mod delete comment"
        );
    }
    const dbComment = await Comment.findOne({ _id: String(commentId) });
    const commentCreatorUsername = dbComment.user.toLowerCase();
    const newUserComments = dbUser.comments.filter((id) => {
        return String(id) !== commentId;
    });
    await User.findOneAndUpdate(
        {
            username: String(commentCreatorUsername),
        },
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
    res.json({ msg: "Comment deleted successfully" });
});

const deleteUsersAccount = wrapper(async (req, res) => {
    if (req.role !== "admin") {
        throw new Error("You are not authorized to perform this action");
    }
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username: username });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
    }
    if (dbUser.role === "admin") {
        throw new Error("Admin accounts cannot be deleted");
    }
    if (dbUser.role === "mod" && role !== "admin") {
        throw new Error("Mod accounts can only be deleted by an admin");
    }
    const userPostIds = dbUser.posts.map((postObj) => {
        return postObj.id;
    });
    if (userPostIds.length > 0) {
        await Post.updateMany(
            { _id: { $in: userPostIds } },
            {
                user: "Deleted",
                content: "This post has been deleted",
                keywords: [],
                history: [],
                hasBeenEdited: false,
            }
        );
    }
    const userCommentIds = dbUser.comments || [];
    const userComments = await Comment.find({ _id: { $in: userCommentIds } });
    const relatedPostIds = userComments.map((commentObj) => {
        return commentObj.relatedPost;
    });
    const relatedPosts = await Post.find({ _id: { $in: relatedPostIds } });
    for (const post of relatedPosts) {
        const newRelatedComments = post.comments.filter((commentId) => {
            return !userCommentIds.includes(commentId);
        });
        await Post.findOneAndUpdate(
            { _id: post._id },
            { comments: newRelatedComments }
        );
    }

    if (userCommentIds.length > 0) {
        await Comment.deleteMany({ _id: { $in: userCommentIds } });
    }
    await User.findByIdAndDelete({ _id: dbUser._id });
    res.status(200);
    res.json({ msg: "Account deleted successfully" });
});

const deleteReport = wrapper(async (req, res) => {
    const reportId = req.params.id;
    if (!reportId) {
        throw new Error("Bad Request Error: Report id not provided");
    }
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (dbUser.role !== "mod" && dbUser.role !== "admin") {
        throw new Error(
            "Not Authorized Error: User attempting to delete report"
        );
    }
    await Report.findByIdAndDelete({ _id: String(reportId) });
    res.status(200);
    res.json({ msg: "Report deleted successfully" });
});

export {
    getUserWarnings,
    sendUserNotification,
    banUser,
    reportMessage,
    getReportedMessages,
    changeAccountRole,
    deleteUsersPost,
    deleteUsersComment,
    deleteUsersAccount,
    deleteReport,
};
