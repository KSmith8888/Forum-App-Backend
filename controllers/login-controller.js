import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { wrapper } from "./wrapper.js";
import { User } from "../models/user-model.js";

const attemptLogin = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const attemptUsername = req.body.username;
    const attemptPassword = req.body.password;
    if (!attemptUsername || !attemptPassword) {
        throw new Error("Credential Error: Username or password not provided");
    }
    if (
        typeof attemptUsername !== "string" ||
        typeof attemptPassword !== "string"
    ) {
        throw new Error("Bad Request Error: Invalid credential type provided");
    }
    const dbUser = await User.findOne({
        username: attemptUsername.toLowerCase(),
    });
    if (!dbUser) {
        throw new Error(
            "Credential Error: No user found with credentials provided"
        );
    }
    const hashedPassword = await bcrypt.compare(
        attemptPassword,
        dbUser.password
    );
    if (!hashedPassword) {
        throw new Error(
            "Credential Error: Provided password does not match stored hash"
        );
    }
    const token = jwt.sign(
        {
            id: dbUser._id,
            username: dbUser.username,
            role: dbUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );
    res.status(200);
    res.json({
        status: "Login successful",
        role: dbUser.role,
        _id: dbUser._id,
        username: dbUser.username,
        displayName: dbUser.displayName,
        profileImageName: dbUser.profileImageName,
        profileImageAlt: dbUser.profileImageAlt,
        token,
    });
});

export { attemptLogin };
