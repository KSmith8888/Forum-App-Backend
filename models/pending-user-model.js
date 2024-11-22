import mongoose from "mongoose";
const { Schema, model } = mongoose;

const pendingUserSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 18,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 60,
        maxlength: 60,
    },
    email: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 40,
    },
    displayName: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 18,
        unique: true,
    },
    verificationCode: {
        type: Number,
        required: true,
    },
    codeExpiration: {
        type: Number,
        required: true,
    },
});

const PendingUser = model("PendingUser", pendingUserSchema);

pendingUserSchema.index({ expireAt: 100 }, { expireAfterSeconds: 100 });

export { PendingUser };
