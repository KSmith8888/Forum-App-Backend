import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";

export const completeEmailUpdate = wrapper(async (req, res) => {
    const userId = req.userId;
    const code = req.body.code;
    const dbUser = await User.findOne({ _id: String(userId) });
    if (!code) {
        throw new Error("Bad Request Error: Verification info not provided");
    }
    if (String(code) !== String(dbUser.emailCode)) {
        throw new Error("Bad Request Error: Verification code does not match");
    }
    const current = Date.now();
    if (dbUser.emailExpiration < current) {
        throw new Error("Bad Request Error: Verification code has expired");
    }
    if (!dbUser.emailTemp) {
        throw new Error("Bad Request Error: Invalid email provided");
    }
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                email: dbUser.emailTemp,
                emailTemp: "",
                emailCode: 0,
                emailExpiration: 0,
            },
        }
    );
    res.status(200);
    res.json({
        message: "Email updated successfully",
    });
});
