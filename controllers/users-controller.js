import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import { User } from "../models/user-model.js";
import { Post } from "../models/post-model.js";
import { Comment } from "../models/comment-model.js";
import { wrapper } from "./wrapper.js";
import { Notification } from "../models/notification-model.js";

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
    const password = req.body.password;
    if (
        !newEmail ||
        typeof newEmail !== "string" ||
        !password ||
        typeof password !== "string"
    ) {
        throw new Error("Bad Request Error: New email was not provided");
    }
    const reg = new RegExp("^[a-zA-Z0-9.:,?/_'!@-]+$");
    if (
        !reg.test(newEmail) ||
        !newEmail.includes("@") ||
        !newEmail.includes(".") ||
        newEmail.length < 6 ||
        newEmail.length > 40
    ) {
        throw new Error("Bad Request Error: Invalid email provided");
    }
    const requestedEmail = await User.findOne({
        email: String(newEmail),
    });
    if (requestedEmail?.email) {
        throw new Error("Email unavailable Error: Duplicate entry");
    }
    const dbUser = await User.findOne({ _id: String(userId) });
    const hashedPassword = await bcrypt.compare(password, dbUser.password);
    if (!hashedPassword) {
        throw new Error("Credential Error: Password does not match");
    }
    const code = Math.floor(Math.random() * (999999 - 100000) + 100000);
    const expiration = Date.now() + 600000;

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    await transporter.sendMail({
        to: String(newEmail),
        subject: "Verify this address to update your account email",
        html: `
        <p>Use the code below to verify this email address</p>
        <p>Verification code: <strong>${code}</strong></p>
        <p>This code will expire if not used within 10 minutes</p>
        `,
    });

    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                emailTemp: String(newEmail),
                emailCode: code,
                emailExpiration: expiration,
            },
        }
    );

    res.status(200);
    res.json({
        message: "Email update initiated successfully",
    });
});

const completeEmailUpdate = wrapper(async (req, res) => {
    const userId = req.userId;
    const code = req.body.code;
    const dbUser = await User.findOne({ _id: String(userId) });
    if (!code) {
        throw new Error("Bad Request Error: Verification info not provided");
    }
    if (String(code) !== String(dbUser.emailCode)) {
        throw new Error("Bad Request Error: Verification code does not match");
    }
    const current = Date.now();
    if (dbUser.emailExpiration < current) {
        throw new Error("Bad Request Error: Verification code has expired");
    }
    if (!dbUser.emailTemp) {
        throw new Error("Bad Request Error: Invalid email provided");
    }
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                email: dbUser.emailTemp,
                emailTemp: "",
                emailCode: 0,
                emailExpiration: 0,
            },
        }
    );
    res.status(200);
    res.json({
        message: "Email updated successfully",
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
                urlTitle: "Deleted",
                previewText: "This post has been deleted",
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
    updateProfilePic,
    updateProfileBio,
    updatePassword,
    updateEmail,
    completeEmailUpdate,
    updateNotificationSetting,
    deleteOwnAccount,
    deleteNotification,
};
