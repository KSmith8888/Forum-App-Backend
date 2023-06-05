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
        minlength: 4,
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
    likedComments: {
        type: [String],
        required: true,
        default: [],
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
