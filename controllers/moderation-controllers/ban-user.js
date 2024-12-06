import { wrapper } from "../wrapper.js";
import { User } from "../../models/user-model.js";
import { Notification } from "../../models/notification-model.js";

export const banUser = wrapper(async (req, res) => {
    const bannedUser = req.body.banUser;
    const banReason = req.body.banReason;
    const banTimestamp = req.body.banTimestamp;
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username: String(username) });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
    }
    if (dbUser.role === "admin") {
        throw new Error("Bad Request Error: Not possible to ban an admin");
    }
    if (
        !bannedUser ||
        !banReason ||
        !banTimestamp ||
        typeof banTimestamp !== "number"
    ) {
        throw new Error("Bad Request Error: Ban info not provided");
    }
    const banEndDate = new Date(banTimestamp).toUTCString();
    const banString = banEndDate.slice(0, 16);
    const banNotification = await Notification.create({
        message: `Your account has been banned until ${banString} for ${banReason}. During the ban, account actions are restricted`,
        type: "Notice",
    });
    await User.findOneAndUpdate(
        { username: String(username) },
        {
            $set: {
                isBanned: true,
                endOfBan: banTimestamp,
                notifications: [...dbUser.notifications, banNotification._id],
            },
        }
    );
    res.status(201);
    res.json({ message: "User banned successfully" });
});
