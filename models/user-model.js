import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 18,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 60,
        maxlength: 60,
    },
    email: {
        type: String,
        minlength: 6,
        maxlength: 40,
        default: "4em@example.com",
    },
    verifiedEmail: {
        type: Boolean,
        required: true,
        default: false,
    },
    role: {
        type: String,
        required: true,
        default: "user",
    },
    displayName: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 18,
        unique: true,
    },
    loginAttempts: {
        type: Number,
        required: true,
        default: 0,
    },
    frozenUntil: {
        type: Number,
        required: true,
        default: 0,
    },
    isBanned: {
        type: Boolean,
        required: true,
        default: false,
    },
    endOfBan: {
        type: Number,
        required: true,
        default: 0,
    },
    pswdLastUpdated: {
        type: String,
        required: true,
        default: "Last updated at account creation",
    },
    posts: {
        type: [
            {
                title: { type: String, required: true },
                previewText: {
                    type: String,
                    required: true,
                },
                urlTitle: {
                    type: String,
                    required: true,
                },
                postId: { type: String, required: true },
                _id: false,
            },
        ],
        required: true,
        default: [],
    },
    comments: {
        type: [
            {
                commentId: { type: String, required: true },
                previewText: { type: String, required: true },
                relatedPost: { type: String, required: true },
                postUrlTitle: {
                    type: String,
                    required: true,
                },
                _id: false,
            },
        ],
        required: true,
        default: [],
    },
    likedPosts: {
        type: [String],
        required: true,
        default: [],
    },
    savedPosts: {
        type: [
            {
                title: { type: String, required: true },
                postId: { type: String, required: true },
                urlTitle: {
                    type: String,
                    required: true,
                },
                _id: false,
            },
        ],
        required: true,
        default: [],
    },
    likedComments: {
        type: [String],
        required: true,
        default: [],
    },
    notifications: {
        type: [String],
        required: true,
        default: [],
    },
    getReplyNotifications: {
        type: Boolean,
        required: true,
        default: true,
    },
    profileBio: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 120,
        default: "4em User",
    },
    profileImageName: {
        type: String,
        required: true,
        default: "blank.png",
    },
    profileImageAlt: {
        type: String,
        required: true,
        default: "A generic, blank outline of a mans upper body",
    },
});

const User = model("User", userSchema);

export { User };
