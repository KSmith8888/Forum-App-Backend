import { wrapper } from "./wrapper.js";
import { Report } from "../models/report-model.js";
import { Post } from "../models/post-model.js";
import { Comment } from "../models/comment-model.js";
import { User } from "../models/user-model.js";
import { Notification } from "../models/notification-model.js";

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
    const userNotifications = await Notification.find({
        "_id": { $in: dbUser.notifications },
    });
    const userWarnings = userNotifications.filter(
        (notification) => notification.type === "Warning"
    );
    res.status(200);
    res.json({
        message: "Warnings retrieved successfully",
        warnings: userWarnings,
    });
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
    const notificationType =
        req.body.isWarning === "Warning" ? "Warning" : "Notice";
    if (!notificationMsg || typeof notificationMsg !== "string") {
        throw new Error("Bad Request Error: Notification message not provided");
    }

    const newNotification = await Notification.create({
        message: notificationMsg,
        type: notificationType,
    });
    await User.findOneAndUpdate(
        { username: username },
        {
            $set: {
                notifications: [...dbUser.notifications, newNotification._id],
            },
        }
    );
    res.status(200);
    res.json({ message: "Notification sent successfully" });
});

const banUser = wrapper(async (req, res) => {
    const bannedUser = req.body.banUser;
    const banReason = req.body.banReason;
    const banTimestamp = req.body.banTimestamp;
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username: String(username) });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
    }
    if (dbUser.role === "admin") {
        throw new Error("Bad Request Error: Not possible to ban an admin");
    }
    if (
        !bannedUser ||
        !banReason ||
        !banTimestamp ||
        typeof banTimestamp !== "number"
    ) {
        throw new Error("Bad Request Error: Ban info not provided");
    }
    const banEndDate = new Date(banTimestamp).toUTCString();
    console.log(banEndDate);
    const banString = banEndDate.slice(0, 16);
    const banNotification = await Notification.create({
        message: `Your account has been banned until ${banString} for ${banReason}. During the ban, account actions are restricted`,
        type: "Notice",
    });
    await User.findOneAndUpdate(
        { username: String(username) },
        {
            $set: {
                isBanned: true,
                endOfBan: banTimestamp,
                notifications: [...dbUser.notifications, banNotification._id],
            },
        }
    );
    res.status(201);
    res.json({ message: "User banned successfully" });
});

const reportMessage = wrapper(async (req, res) => {
    if (
        !req.body.reportId ||
        !req.body.reportType ||
        !req.body.reportRelated ||
        !req.body.reportContent
    ) {
        throw new Error(
            "Bad Request Error: Reported message info not provided"
        );
    }
    await Report.create({
        messageId: String(req.body.reportId),
        messageType: String(req.body.reportType),
        messageContent: String(req.body.reportContent),
        reportedBy: String(req.username),
        relatedPost: String(req.body.reportRelated),
    });
    res.status(201);
    res.json({ message: "Message reported successfully" });
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
        message: "Account role updated successfully",
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
                title: "This post has been deleted",
                content: "This post has been deleted",
                previewText: "This post has been deleted",
                keywords: [],
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            },
        }
    );
    res.status(200);
    res.json({ message: "Post deleted successfully" });
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
    const commentCreatorName = dbComment.user.toLowerCase();
    const commentCreator = User.find({ username: commentCreatorName });
    if (!commentCreator) {
        throw new Error("Not Found Error: No user with that username found");
    }
    const newUserComments = commentCreator.comments.filter((comment) => {
        return String(comment.commentId) !== commentId;
    });
    await User.findOneAndUpdate(
        {
            username: String(commentCreatorName),
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
                previewText: "This comment has been deleted",
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            },
        }
    );
    res.status(200);
    res.json({ message: "Comment deleted successfully" });
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
                postType: "Text",
                content: "This post has been deleted",
                previewText: "This post has been deleted",
                keywords: [],
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            }
        );
    }
    const userCommentIds = dbUser.comments || [];
    if (userCommentIds.length > 0) {
        await Comment.updateMany(
            { _id: { $in: userCommentIds } },
            {
                user: "Deleted",
                content: "This comment has been deleted",
                previewText: "This comment has been deleted",
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            }
        );
    }
    await User.findByIdAndDelete({ _id: dbUser._id });
    res.status(200);
    res.json({ message: "Account deleted successfully" });
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
    res.json({ message: "Report deleted successfully" });
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
