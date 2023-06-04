import bcrypt from "bcrypt";

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
        throw new Error("Username unavailable Error:");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userInfo = {
        username: username,
        password: hashedPassword,
    };
    await User.create(userInfo);

    res.status(201);
    res.json({
        status: "New account created successfully",
    });
});

const updateProfilePic = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const userId = req.userId;
    const newProfilePicName = req.body.name;
    const newProfilePicAlt = req.body.alt;
    await User.findOneAndUpdate(
        { _id: userId },
        {
            $set: {
                profileImageName: newProfilePicName,
                profileImageAlt: newProfilePicAlt,
            },
        }
    );
    res.status(200);
    res.json({ status: "Profile picture updated successfully" });
});

export { createNewUser, updateProfilePic };
