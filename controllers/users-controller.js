import bcrypt from "bcrypt";

import { User } from "../models/user-model.js";
import { wrapper } from "../middleware/wrapper.js";

const createNewUser = wrapper(async (req, res) => {
    res.header(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
    );
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
        role: "user",
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
