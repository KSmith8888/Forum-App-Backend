import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";
import { Notification } from "../../models/notification-model.js";

export const deleteNotification = wrapper(async (req, res) => {
    const userId = req.userId;
    const notificationId = req.params.id;
    if (!userId || !notificationId || typeof notificationId !== "string") {
        throw new Error("Must provide user ID and notification ID");
    }
    const dbUser = await User.findOne({ _id: String(userId) });
    const matchingNotification = await Notification.findOne({
        _id: notificationId,
    });
    if (!matchingNotification) {
        throw new Error("No notification found matching that id");
    }
    if (matchingNotification.type === "Warning" && req.role !== "admin") {
        throw new Error(
            "Not Authorized Error: User attempted to delete warning"
        );
    }
    const newNotifications = dbUser.notifications.filter(
        (notification) => String(notification) !== notificationId
    );
    await Notification.findByIdAndDelete({ _id: String(notificationId) });
    await User.findOneAndUpdate(
        { _id: String(userId) },
        {
            $set: {
                notifications: newNotifications,
            },
        }
    );
    res.status(200);
    res.json({
        message: `Notification deleted successfully -Target ID-${notificationId}`,
    });
});
