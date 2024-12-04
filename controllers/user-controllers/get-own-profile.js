import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";
import { Notification } from "../../models/notification-model.js";

export const getOwnProfile = wrapper(async (req, res) => {
    const userId = req.userId;
    const dbUser = await User.findOne({ _id: String(userId) });
    if (!dbUser) {
        throw new Error("Not Found Error: No user found with that username");
    }
    const userNotifications = await Notification.find({
        "_id": { $in: dbUser.notifications },
    });
    res.status(200);
    res.json({
        posts: dbUser.posts,
        comments: dbUser.comments,
        savedPosts: dbUser.savedPosts,
        notifications: userNotifications.reverse(),
        bio: dbUser.profileBio,
        pswdLastUpdated: dbUser.pswdLastUpdated,
        replySetting: dbUser.getReplyNotifications,
        email: dbUser.email,
        verifiedEmail: dbUser.verifiedEmail,
    });
});
