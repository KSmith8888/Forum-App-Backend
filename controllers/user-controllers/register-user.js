import { User } from "../../models/user-model.js";
import { PendingUser } from "../../models/pending-user-model.js";
import { wrapper } from "../wrapper.js";
import { Notification } from "../../models/notification-model.js";

export const registerUser = wrapper(async (req, res) => {
    const code = req.body.code;
    const pendingId = req.body.pendingId;
    if (!code || !pendingId) {
        throw new Error("Bad Request Error: Did not provide registration info");
    }
    const dbPending = await PendingUser.findOne({
        _id: String(pendingId),
    });
    if (!dbPending) {
        throw new Error("Bad Request Error: Verification info is not valid");
    }
    if (dbPending.registerAttempts >= 3) {
        throw new Error("Bad Request Error: Too many registration attempts");
    }
    const newAttempts = dbPending.registerAttempts + 1;
    await PendingUser.findOneAndUpdate(
        { _id: String(pendingId) },
        {
            $set: {
                registerAttempts: newAttempts,
            },
        }
    );
    if (String(code) !== String(dbPending.verificationCode)) {
        throw new Error("Bad Request Error: Verification code does not match");
    }
    const current = Date.now();
    if (dbPending.codeExpiration < current) {
        throw new Error("Bad Request Error: Verification code has expired");
    }
    const newNotification = await Notification.create({
        message: "Welcome to 4em, your account is now active.",
        type: "Notice",
    });
    const currentDate = new Date().toDateString();
    await User.create({
        username: dbPending.username,
        password: dbPending.password,
        displayName: dbPending.displayName,
        email: dbPending.email,
        pswdLastUpdated: `Last updated - ${currentDate}`,
        notifications: [newNotification._id],
    });
    res.status(201);
    res.json({
        message: "New account created successfully",
    });
});
