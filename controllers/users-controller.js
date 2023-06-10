import bcrypt from "bcrypt";

import { User } from "../models/user-model.js";
import { Post } from "../models/post-model.js";
import { Comment } from "../models/comment-model.js";
import { wrapper } from "./wrapper.js";

const createNewUser = wrapper(async (req, res) => {
    if (!req.body.username || !req.body.password) {
        throw new Error(
            "Bad Request Error: Username or password was not provided"
        );
    }
    if (
        typeof req.body.username !== "string" ||
        typeof req.body.password !== "string"
    ) {
        throw new Error(
            "Bad Request Error: Username or password was not provided"
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
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userInfo = {
        username: username,
        password: hashedPassword,
        displayName: displayName,
    };
    await User.create(userInfo);

    res.status(201);
    res.json({
        msg: "New account created successfully",
    });
});

const changeRoleToMod = wrapper(async (req, res) => {
    const userRole = req.role;
    const modUsername = req.body.modUsername;
    if (userRole !== "admin") {
        throw new Error(
            "Role Error: Attempt to create mod without admin access"
        );
    }
    if (!modUsername) {
        throw new Error("User id of new mod not provided");
    }
    const dbMod = await User.findOne({ username: String(modUsername) });
    if (!dbMod) {
        throw new Error("That user does not exist");
    }
    await User.findOneAndUpdate(
        { username: modUsername },
        {
            $set: {
                role: "mod",
            },
        }
    );

    res.status(201);
    res.json({
        msg: "Mod role updated successfully",
    });
});

const updateProfilePic = wrapper(async (req, res) => {
    const userId = req.userId;
    const newProfilePicName = req.body.name;
    const newProfilePicAlt = req.body.alt;
    if (!newProfilePicName || !newProfilePicAlt) {
        throw new Error(
            "Bad Request Error: Picture name or alt was not provided"
        );
    }
    await User.findOneAndUpdate(
        { _id: userId },
        {
            $set: {
                profileImageName: String(newProfilePicName),
                profileImageAlt: String(newProfilePicAlt),
            },
        }
    );
    res.status(200);
    res.json({ msg: "Profile picture updated successfully" });
});

const deleteOwnAccount = wrapper(async (req, res) => {
    const dbUser = await User.findOne({ _id: req.userId });
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

export {
    createNewUser,
    changeRoleToMod,
    updateProfilePic,
    deleteOwnAccount,
    deleteUsersAccount,
};
