import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 18,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 180,
        trim: true,
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
        trim: true,
    },
    pswdLastUpdated: {
        type: String,
        required: true,
        default: "Last updated at account creation",
    },
    numOfWarnings: {
        type: Number,
        required: true,
        default: 0,
    },
    posts: {
        type: [Object],
        required: true,
        default: [],
    },
    comments: {
        type: [String],
        required: true,
        default: [],
    },
    likedPosts: {
        type: [String],
        required: true,
        default: [],
    },
    savedPosts: {
        type: [Object],
        required: true,
        default: [],
    },
    likedComments: {
        type: [String],
        required: true,
        default: [],
    },
    notifications: {
        type: [Object],
        required: true,
        default: [],
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
