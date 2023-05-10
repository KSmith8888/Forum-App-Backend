import mongoose from "mongoose";

import { Comment } from "./comment-model.js";

const { Schema, model } = mongoose;

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 60,
        unique: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 900,
        trim: true,
    },
    topic: {
        type: String,
        required: true,
        trim: true,
    },
    time: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    likes: {
        type: Number,
        required: true,
        default: 0,
    },
    comments: {
        type: [Comment],
        required: true,
        default: [],
    },
});

const Post = model("Post", postSchema);

export { Post };
