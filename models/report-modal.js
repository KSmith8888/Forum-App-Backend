import mongoose from "mongoose";
const { Schema, model } = mongoose;

const reportSchema = new Schema(
    {
        messageId: {
            type: String,
        },
        messageType: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Report = model("Report", reportSchema);

export { Report, reportSchema };
