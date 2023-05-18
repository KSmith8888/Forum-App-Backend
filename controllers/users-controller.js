import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "../models/user-model.js";
import { wrapper } from "./wrapper.js";

const createNewUser = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const username = req.body.username;
    const password = req.body.password;
    const requestedUsername = await User.findOne({
        username: String(username),
    });
    if (requestedUsername) {
        throw new Error(
            "Sorry, that username is not available. Please choose a different username"
        );
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userInfo = {
        username: username,
        password: hashedPassword,
    };
    await User.create(userInfo);
    const dbUser = await User.findOne({
        username: String(username),
    });
    const token = jwt.sign(
        {
            id: dbUser._id,
            username: dbUser.username,
            admin: dbUser.admin,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );
    res.status(201);
    res.json({
        status: "New account created successfully",
        role: dbUser.role,
        _id: dbUser._id,
        username: dbUser.username,
        token,
    });
});

export { createNewUser };
