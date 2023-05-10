import mongoose from "mongoose";
const { Schema, model } = mongoose;

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 300,
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
});

const Comment = model("Comment", commentSchema);

export { Comment };
