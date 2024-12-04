import bcrypt from "bcrypt";

import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";

export const completeReset = wrapper(async (req, res) => {
    const code = req.body.code;
    const username = req.body.username;
    const newPassword = req.body.password;
    const reg = new RegExp("^[a-zA-Z0-9.:,?/_'!@-]+$");
    if (!code || !username || !newPassword || !reg.test(newPassword)) {
        throw new Error("Bad Request Error: Reset password info not provided");
    }
    const dbUser = await User.findOne({ username: String(username) });
    if (!dbUser) {
        throw new Error("Bad Request Error: Reset info is not valid");
    }
    const current = Date.now();
    if (dbUser.resetExpiration < current) {
        throw new Error("Bad Request Error: Reset code has expired");
    }
    if (dbUser.loginAttempts >= 3) {
        if (current < dbUser.frozenUntil) {
            throw new Error(
                "Bad Request Error: Attempted reset during account freeze"
            );
        } else {
            await User.findOneAndUpdate(
                { _id: String(dbUser._id) },
                {
                    $set: {
                        loginAttempts: 0,
                        frozenUntil: 0,
                    },
                }
            );
        }
    }
    if (String(code) !== String(dbUser.resetCode)) {
        const newAttempts = dbUser.loginAttempts + 1;
        const freezeTime = newAttempts >= 3 ? current + 600000 : 0;
        await User.findOneAndUpdate(
            { _id: String(dbUser._id) },
            {
                $set: {
                    loginAttempts: newAttempts,
                    frozenUntil: freezeTime,
                },
            }
        );
        throw new Error("Bad Request Error: Reset code does not match");
    }
    const saltRounds = 10;
    const newHash = await bcrypt.hash(String(newPassword), saltRounds);
    const currentDate = new Date();
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                password: newHash,
                pswdLastUpdated: `Last updated - ${currentDate.toDateString()}`,
                resetCode: 0,
                resetExpiration: 0,
            },
        }
    );
    res.status(200);
    res.json({
        message: "Password reset successfully",
    });
});
