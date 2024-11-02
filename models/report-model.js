import mongoose from "mongoose";
const { Schema, model } = mongoose;

const reportSchema = new Schema(
    {
        messageId: {
            type: String,
            required: true,
        },
        postUrlTitle: {
            type: String,
            required: true,
            default: "url_title",
        },
        messageType: {
            type: String,
            required: true,
        },
        messageContent: {
            type: String,
            required: true,
        },
        reportedBy: {
            type: String,
            required: true,
        },
        relatedPost: {
            type: String,
            required: true,
            default: "none",
        },
    },
    {
        timestamps: true,
    }
);

const Report = model("Report", reportSchema);

export { Report, reportSchema };
