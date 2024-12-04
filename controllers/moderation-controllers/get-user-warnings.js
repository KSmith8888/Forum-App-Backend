import { wrapper } from ".././wrapper.js";
import { User } from "../../models/user-model.js";
import { Notification } from "../../models/notification-model.js";

export const getUserWarnings = wrapper(async (req, res) => {
    const role = req.role;
    if (role !== "mod" && role !== "admin") {
        throw new Error("You are not authorized to perform this action");
    }
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username: username });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
    }
    const userNotifications = await Notification.find({
        "_id": { $in: dbUser.notifications },
    });
    const userWarnings = userNotifications.filter(
        (notification) => notification.type === "Warning"
    );
    res.status(200);
    res.json({
        message: "Warnings retrieved successfully",
        warnings: userWarnings,
    });
});
