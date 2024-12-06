import { wrapper } from "../wrapper.js";
import { User } from "../../models/user-model.js";
import { Notification } from "../../models/notification-model.js";

export const sendUserNotification = wrapper(async (req, res) => {
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
    const notificationMsg = req.body.notificationMsg;
    const notificationType =
        req.body.isWarning === "Warning" ? "Warning" : "Notice";
    if (!notificationMsg || typeof notificationMsg !== "string") {
        throw new Error("Bad Request Error: Notification message not provided");
    }

    const newNotification = await Notification.create({
        message: notificationMsg,
        type: notificationType,
    });
    await User.findOneAndUpdate(
        { username: username },
        {
            $set: {
                notifications: [...dbUser.notifications, newNotification._id],
            },
        }
    );
    res.status(200);
    res.json({ message: "Notification sent successfully" });
});
