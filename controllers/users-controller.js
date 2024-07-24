import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { User } from "../models/user-model.js";
import { Post } from "../models/post-model.js";
import { Comment } from "../models/comment-model.js";
import { wrapper } from "./wrapper.js";

const getOwnProfile = wrapper(async (req, res) => {
    const userId = req.userId;
    const dbUser = await User.findOne({ _id: String(userId) });
    const commentObjectIds = dbUser.comments.map((id) => {
        return new mongoose.Types.ObjectId(id);
    });
    const userComments = await Comment.find({
        _id: {
            $in: commentObjectIds,
        },
    });
    const userPostData = dbUser.posts;
    const userNotifications = dbUser.notifications;
    const userSavedPosts = dbUser.savedPosts;
    res.status(200);
    res.json({
        posts: userPostData,
        comments: userComments,
        savedPosts: userSavedPosts,
        notifications: userNotifications,
        bio: dbUser.profileBio,
        pswdLastUpdated: dbUser.pswdLastUpdated,
    });
});

const getUserProfile = wrapper(async (req, res) => {
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username: String(username) });
    if (!dbUser) {
        throw new Error("Not Found Error: No user found with that username");
    }
    const commentObjectIds = dbUser.comments.map((id) => {
        return new mongoose.Types.ObjectId(id);
    });
    const userComments = await Comment.find({
        _id: {
            $in: commentObjectIds,
        },
    });
    const userPostData = dbUser.posts;
    res.status(200);
    res.json({
        username: dbUser.displayName,
        posts: userPostData,
        comments: userComments,
        bio: dbUser.profileBio,
        image: dbUser.profileImageName,
        alt: dbUser.profileImageAlt,
    });
});

const createNewUser = wrapper(async (req, res) => {
    if (!req.body.username || !req.body.password || !req.body.terms) {
        throw new Error(
            "Bad Request Error: Registration info was not provided"
        );
    }
    if (
        typeof req.body.username !== "string" ||
        typeof req.body.password !== "string" ||
        req.body.password.includes(" ")
    ) {
        throw new Error(
            "Bad Request Error: Username or password not in proper format"
        );
    }
    const displayName = req.body.username;
    const username = displayName.toLowerCase();
    const password = req.body.password;
    const requestedUsername = await User.findOne({
        username: username,
    });
    if (requestedUsername?.username) {
        throw new Error("Username unavailable Error: Duplicate entry");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(String(password), saltRounds);
    const currentDate = new Date().toDateString();
    const userInfo = {
        username: username,
        password: hashedPassword,
        displayName: String(displayName),
        pswdLastUpdated: `Last updated - ${currentDate}`,
    };
    await User.create(userInfo);

    res.status(201);
    res.json({
        msg: "New account created successfully",
    });
});

const updateProfilePic = wrapper(async (req, res) => {
    const userId = req.userId;
    const newProfilePicName = req.body.pfpName;
    const newProfilePicAlt = req.body.pfpAlt;
    if (!newProfilePicName || !newProfilePicAlt) {
        throw new Error(
            "Bad Request Error: Picture name or alt was not provided"
        );
    }
    await User.findOneAndUpdate(
        { _id: String(userId) },
        {
            $set: {
                profileImageName: String(newProfilePicName),
                profileImageAlt: String(newProfilePicAlt),
            },
        }
    );
    res.status(200);
    res.json({
        message: "Profile picture updated successfully",
        newProfilePicName,
        newProfilePicAlt,
    });
});

const updateProfileBio = wrapper(async (req, res) => {
    const userId = req.userId;
    const newBio = req.body.bioContent;
    if (!userId) {
        throw new Error("Must provide user ID");
    }
    const dbUser = await User.findOne({ _id: String(userId) });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
    }
    await User.findOneAndUpdate(
        { _id: String(userId) },
        {
            $set: {
                profileBio: newBio,
            },
        }
    );
    res.status(200);
    res.json({
        message: `Bio updated to: ${newBio}`,
    });
});

const updatePassword = wrapper(async (req, res) => {
    const userId = req.userId;
    const currentPassword = req.body.reqCurrentPass;
    const newPassword = req.body.reqNewPass;
    if (!userId) {
        throw new Error("Must provide user ID");
    }
    const dbUser = await User.findOne({ _id: String(userId) });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
    }
    const hashedPassword = await bcrypt.compare(
        currentPassword,
        dbUser.password
    );
    if (!hashedPassword) {
        throw new Error(
            "Credential Error: Provided password does not match stored hash"
        );
    }
    const saltRounds = 10;
    const newHash = await bcrypt.hash(String(newPassword), saltRounds);
    const currentDate = new Date();
    await User.findOneAndUpdate(
        { _id: String(userId) },
        {
            $set: {
                password: newHash,
                pswdLastUpdated: `Last updated - ${currentDate.toDateString()}`,
            },
        }
    );

    res.status(200);
    res.json({
        message: `Password updated - ${currentDate}`,
    });
});

const deleteOwnAccount = wrapper(async (req, res) => {
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
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
                keywords: [],
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
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
        await Comment.updateMany(
            { _id: { $in: userCommentIds } },
            {
                user: "Deleted",
                content: "This comment has been deleted",
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

const deleteNotification = wrapper(async (req, res) => {
    const userId = req.userId;
    const notificationId = req.params.id;
    if (!userId || !notificationId) {
        throw new Error("Must provide user ID and notification ID");
    }
    const dbUser = await User.findOne({ _id: String(userId) });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
    }
    const matchingNotification = dbUser.notifications.find(
        (note) => note._id === notificationId
    );
    if (!matchingNotification) {
        throw new Error("No notification found matching that id");
    }
    if (matchingNotification.type === "Warning" && req.role !== "admin") {
        throw new Error("You are not authorized to perform this action");
    }
    const newNotifications = dbUser.notifications.filter(
        (notification) => String(notification._id) !== notificationId
    );
    await User.findOneAndUpdate(
        { _id: String(userId) },
        {
            $set: {
                notifications: newNotifications,
            },
        }
    );
    res.status(200);
    res.json({
        message: `Notification deleted successfully -Target ID-${notificationId}`,
    });
});

export {
    getOwnProfile,
    getUserProfile,
    createNewUser,
    updateProfilePic,
    updateProfileBio,
    updatePassword,
    deleteOwnAccount,
    deleteNotification,
};
