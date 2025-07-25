import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";

export const updateReplySetting = wrapper(async (req, res) => {
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const newSetting = !dbUser.profileSettings.getReplyNotifications;
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
        {
            $set: {
                profileSettings: {
                    getReplyNotifications: newSetting,
                    viewNSFW: dbUser.profileSettings.viewNSFW,
                },
            },
        }
    );
    const isSettingOn = newSetting ? "On" : "Off";
    res.status(200);
    res.json({
        message: `Reply notifications are now turned ${isSettingOn}`,
    });
});
