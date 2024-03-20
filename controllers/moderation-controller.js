import { wrapper } from "./wrapper.js";
import { Report } from "../models/report-modal.js";
import { Post } from "../models/post-model.js";
import { User } from "../models/user-model.js";

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
    const newUserPosts = dbUser.posts.filter((postObj) => {
        return String(postObj.id) !== String(postId);
    });
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
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

const deleteUsersAccount = wrapper(async (req, res) => {
    const role = req.role;
    if (role !== "mod" && role !== "admin") {
        throw new Error("You are not authorized to perform this action");
    }
    const username = req.params.username;
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
    reportMessage,
    getReportedMessages,
    changeAccountRole,
    deleteUsersPost,
    deleteUsersAccount,
    deleteReport,
};
