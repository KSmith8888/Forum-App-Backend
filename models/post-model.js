import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            minlength: 8,
            maxlength: 60,
            trim: true,
        },
        content: {
            type: String,
            required: true,
            minlength: 12,
            maxlength: 900,
        },
        urlTitle: {
            type: String,
            required: true,
            minlength: 9,
            maxlength: 30,
            default: "url_title",
        },
        previewText: {
            type: String,
            required: true,
            minlength: 12,
            maxlength: 55,
        },
        postType: {
            type: String,
            required: true,
            default: "Text",
        },
        topic: {
            type: String,
            required: true,
            trim: true,
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
        keywords: {
            type: [String],
            required: true,
            default: [],
        },
        pollData: {
            type: [
                {
                    option: { type: String, required: true },
                    votes: { type: Number, required: true },
                    _id: false,
                },
            ],
            required: true,
            default: [],
        },
        comments: {
            type: [String],
            required: true,
            default: [],
        },
        isNSFW: {
            type: Boolean,
            required: true,
            default: false,
        },
        isPinned: {
            type: Boolean,
            required: true,
            default: false,
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
    },
    {
        timestamps: true,
    }
);

const Post = model("Post", postSchema);

export { Post };
