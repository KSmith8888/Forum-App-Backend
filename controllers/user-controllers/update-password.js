import bcrypt from "bcrypt";

import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";

export const updatePassword = wrapper(async (req, res) => {
    const userId = req.userId;
    const currentPassword = req.body.reqCurrentPass;
    const newPassword = req.body.reqNewPass;
    if (!currentPassword || !newPassword) {
        throw new Error(
            "Bad Request Error: Current or new password was not provided"
        );
    }
    const dbUser = await User.findOne({ _id: String(userId) });
    const hashedPassword = await bcrypt.compare(
        currentPassword,
        dbUser.password
    );
    if (!hashedPassword) {
        throw new Error(
            "Credential Error: Provided password does not match stored hash"
        );
    }
    const saltRounds = 10;
    const newHash = await bcrypt.hash(String(newPassword), saltRounds);
    const currentDate = new Date();
    await User.findOneAndUpdate(
        { _id: String(userId) },
        {
            $set: {
                password: newHash,
                pswdLastUpdated: `Last updated - ${currentDate.toDateString()}`,
            },
        }
    );

    res.status(200);
    res.json({
        message: `Password updated successfully-Target ID-${Date.now()}`,
    });
});
