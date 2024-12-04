import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";

export const updateReplySetting = wrapper(async (req, res) => {
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const newSetting = !dbUser.getReplyNotifications;
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
        {
            $set: {
                getReplyNotifications: newSetting,
            },
        }
    );
    const isSettingOn = newSetting ? "On" : "Off";
    res.status(200);
    res.json({
        message: `Reply notifications are now turned ${isSettingOn}`,
    });
});
