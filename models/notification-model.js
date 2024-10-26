import mongoose from "mongoose";
const { Schema, model } = mongoose;

const notificationSchema = new Schema(
    {
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        relatedPostId: {
            type: String,
            required: true,
            default: "none",
        },
        commentId: {
            type: String,
            required: true,
            default: "none",
        },
    },
    {
        timestamps: true,
    }
);

const Notification = model("Notification", notificationSchema);

export { Notification, notificationSchema };
