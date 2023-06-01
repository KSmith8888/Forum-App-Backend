import mongoose from "mongoose";
const { Schema, model } = mongoose;

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            minlength: 4,
            maxlength: 300,
        },
        likes: {
            type: Number,
            required: true,
            default: 0,
        },
        user: {
            type: String,
            required: true,
            minlength: 4,
            maxlength: 18,
            default: "User",
        },
        relatedPost: {
            type: String,
            required: true,
        },
        hasBeenEdited: {
            type: Boolean,
            required: true,
            default: false,
        },
        history: {
            type: [Object],
            required: true,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Comment = model("Comment", commentSchema);

export { Comment, commentSchema };
