import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 180,
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
        default: "user",
    },
    posts: {
        type: Array,
        default: [],
    },
});

const User = model("User", userSchema);

export { User };
