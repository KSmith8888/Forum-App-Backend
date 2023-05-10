import { wrapper } from "./wrapper.js";
import { User } from "../models/user-model.js";

const attemptLogin = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const attemptUsername = req.body.username;
    const attemptPassword = req.body.password;
    if (!attemptUsername || !attemptPassword) {
        throw new Error("Credential Error: Username or password not provided");
    }
    const dbUser = await User.findOne({
        username: String(attemptUsername),
    });
    if (!dbUser) {
        throw new Error(
            "Credential Error: No user found with credentials provided"
        );
    }
    res.status(200);
    res.json({
        status: "Login successful",
        role: dbUser.role,
        _id: dbUser._id,
        username: dbUser.username,
    });
});

export { attemptLogin };
