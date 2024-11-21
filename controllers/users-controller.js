import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import { User } from "../models/user-model.js";
import { Post } from "../models/post-model.js";
import { Comment } from "../models/comment-model.js";
import { wrapper } from "./wrapper.js";
import { Notification } from "../models/notification-model.js";

const getOwnProfile = wrapper(async (req, res) => {
    const userId = req.userId;
    const dbUser = await User.findOne({ _id: String(userId) });
    if (!dbUser) {
        throw new Error("Not Found Error: No user found with that username");
    }
    const userNotifications = await Notification.find({
        "_id": { $in: dbUser.notifications },
    });
    res.status(200);
    res.json({
        posts: dbUser.posts,
        comments: dbUser.comments,
        savedPosts: dbUser.savedPosts,
        notifications: userNotifications.reverse(),
        bio: dbUser.profileBio,
        pswdLastUpdated: dbUser.pswdLastUpdated,
        replySetting: dbUser.getReplyNotifications,
        email: dbUser.email,
        verifiedEmail: dbUser.verifiedEmail,
    });
});

const getUserProfile = wrapper(async (req, res) => {
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username: String(username) });
    if (!dbUser) {
        throw new Error("Not Found Error: No user found with that username");
    }
    res.status(200);
    res.json({
        username: dbUser.displayName,
        posts: dbUser.posts,
        comments: dbUser.comments,
        bio: dbUser.profileBio,
        image: dbUser.profileImageName,
        alt: dbUser.profileImageAlt,
    });
});

const createNewUser = wrapper(async (req, res) => {
    if (
        !req.body.username ||
        !req.body.password ||
        !req.body.terms ||
        !req.body.email
    ) {
        throw new Error(
            "Bad Request Error: Registration info was not provided"
        );
    }
    const usernameReg = new RegExp("^[a-zA-Z0-9_]+$");
    const reg = new RegExp("^[a-zA-Z0-9.:,?/_'!@-]+$");
    if (
        typeof req.body.username !== "string" ||
        typeof req.body.password !== "string" ||
        !reg.test(req.body.password) ||
        !usernameReg.test(req.body.username) ||
        req.body.password.length > 40
    ) {
        throw new Error(
            "Bad Request Error: Username or password not in proper format"
        );
    }
    if (
        typeof req.body.email !== "string" ||
        !reg.test(req.body.email) ||
        !req.body.email.includes("@") ||
        !req.body.email.includes(".")
    ) {
        throw new Error("Bad Request Error: Email not in proper format");
    }
    const bannedNames = ["deleted", "admin", "mod"];
    const displayName = req.body.username;
    const username = displayName.toLowerCase();
    if (bannedNames.includes(username)) {
        throw new Error("Bad Request Error: Banned username attempt");
    }
    const password = req.body.password;
    const requestedUsername = await User.findOne({
        username: String(username),
    });
    if (requestedUsername?.username) {
        throw new Error("Username unavailable Error: Duplicate entry");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(String(password), saltRounds);
    const userEmail = req.body.email;
    const requestedEmail = await User.findOne({
        email: String(userEmail),
    });
    if (requestedEmail?.email) {
        throw new Error("Email unavailable Error: Duplicate entry");
    }
    const newNotification = await Notification.create({
        message:
            "Welcome to 4em, your account is now active. If you provided an email address, please follow the instructions in the verification email that was sent so you can use if for password resets if needed.",
        type: "Notice",
    });
    const currentDate = new Date().toDateString();
    await User.create({
        username: String(username),
        password: String(hashedPassword),
        displayName: String(displayName),
        email: String(userEmail),
        pswdLastUpdated: `Last updated - ${currentDate}`,
        notifications: [newNotification._id],
    });
    res.status(201);
    res.json({
        message: "New account created successfully",
    });
});

const resetPassword = wrapper(async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    if (
        !username ||
        !email ||
        typeof username !== "string" ||
        typeof email !== "string"
    ) {
        throw new Error(
            "Bad Request Error: Username or email was not provided"
        );
    }
    const dbUser = await User.findOne({
        username: String(username.toLowerCase()),
    });
    if (!dbUser) {
        throw new Error("Credential Error: No user found with that username");
    }
    if (dbUser.email === "4em@example.com" || dbUser.email !== email) {
        throw new Error(
            "Credential Error: Provided email does not match user email"
        );
    }
    if (!dbUser.verifiedEmail) {
        throw new Error("Email Not Verified Error: User email is not verified");
    }
    res.status(200);
    res.json({
        message: "Password reset successfully",
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
    if (!newBio) {
        throw new Error("Must provide new bio content");
    }
    await User.findOneAndUpdate(
        { _id: String(userId) },
        {
            $set: {
                profileBio: newBio,
            },
        }
    );
    const currentDate = Date.now();
    res.status(200);
    res.json({
        message: `Bio updated successfully-Target ID-${currentDate}`,
    });
});

const updatePassword = wrapper(async (req, res) => {
    const userId = req.userId;
    const currentPassword = req.body.reqCurrentPass;
    const newPassword = req.body.reqNewPass;
    if (!currentPassword || !newPassword) {
        throw new Error(
            "Bad Request Error: Current or new password was not provided"
        );
    }
    const dbUser = await User.findOne({ _id: String(userId) });
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
        message: `Password updated successfully-Target ID-${Date.now()}`,
    });
});

const updateEmail = wrapper(async (req, res) => {
    const userId = req.userId;
    const newEmail = req.body.email;
    if (!newEmail || typeof newEmail !== "string") {
        throw new Error("Bad Request Error: New email was not provided");
    }
    const reg = new RegExp("^[a-zA-Z0-9.:,?/_'!@-]+$");
    if (
        !reg.test(newEmail) ||
        !newEmail.includes("@") ||
        !newEmail.includes(".")
    ) {
        throw new Error("Bad Request Error: Invalid email provided");
    }
    /*
    const requestedEmail = await User.findOne({
        email: String(newEmail),
    });
    if (requestedEmail?.email) {
        throw new Error("Email unavailable Error: Duplicate entry");
    }
    */
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const code = Math.floor(Math.random() * (999999 - 100000) + 100000);
    transporter
        .sendMail({
            to: String(newEmail),
            subject: "Verify this address to update your account email",
            html: `
        <p>Use the code below to verify this email address</p>
        <p>Verification code: ${code}</p>
        <p>This code will expire if not used within 10 minutes</p>
        `,
        })
        .then(() => {
            console.log("Email sent");
        })
        .catch((err) => {
            if (err instanceof Error) {
                console.log(err.message);
            }
        });
    await User.findOneAndUpdate(
        { _id: String(userId) },
        {
            $set: {
                email: String(newEmail),
                verifiedEmail: false,
            },
        }
    );

    res.status(200);
    res.json({
        message: `Email updated successfully-Target ID-${Date.now()}`,
    });
});

const updateNotificationSetting = wrapper(async (req, res) => {
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const newSetting = !dbUser.getReplyNotifications;
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
        {
            $set: {
                getReplyNotifications: newSetting,
            },
        }
    );
    const isSettingOn = newSetting ? "On" : "Off";
    res.status(200);
    res.json({
        message: `Reply notifications are now turned ${isSettingOn}`,
    });
});

const deleteOwnAccount = wrapper(async (req, res) => {
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const userPostIds = dbUser.posts.map((postObj) => {
        return postObj.postId;
    });
    if (userPostIds.length > 0) {
        await Post.updateMany(
            { _id: { $in: userPostIds } },
            {
                user: "Deleted",
                postType: "Text",
                title: "This post has been deleted",
                content: "This post has been deleted",
                keywords: [],
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            }
        );
    }
    const userCommentIds = dbUser.posts.map((commentObj) => {
        return commentObj.commentId;
    });
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
    if (!userId || !notificationId || typeof notificationId !== "string") {
        throw new Error("Must provide user ID and notification ID");
    }
    const dbUser = await User.findOne({ _id: String(userId) });
    const matchingNotification = await Notification.findOne({
        _id: notificationId,
    });
    if (!matchingNotification) {
        throw new Error("No notification found matching that id");
    }
    if (matchingNotification.type === "Warning" && req.role !== "admin") {
        throw new Error(
            "Not Authorized Error: User attempted to delete warning"
        );
    }
    const newNotifications = dbUser.notifications.filter(
        (notification) => String(notification) !== notificationId
    );
    await Notification.findByIdAndDelete({ _id: String(notificationId) });
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
    resetPassword,
    updateProfilePic,
    updateProfileBio,
    updatePassword,
    updateEmail,
    updateNotificationSetting,
    deleteOwnAccount,
    deleteNotification,
};
