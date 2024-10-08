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
        previewText: {
            type: String,
            required: true,
            minlength: 4,
            maxlength: 55,
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
        lastEditedAt: {
            type: String,
            required: true,
            default: "unedited",
        },
        history: {
            type: [
                {
                    content: { type: String, required: true },
                    timestamp: { type: Date, required: true },
                    editNumber: { type: String, required: true },
                    _id: false,
                },
            ],
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
            default: "A generic blank avatar image of a mans head",
        },
        commentReply: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Comment = model("Comment", commentSchema);

export { Comment, commentSchema };
