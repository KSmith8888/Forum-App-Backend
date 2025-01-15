import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";

export const updateNsfwSetting = wrapper(async (req, res) => {
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const newSetting = !dbUser.profileSettings.viewNSFW;
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
        {
            $set: {
                profileSettings: {
                    getReplyNotifications:
                        dbUser.profileSettings.getReplyNotifications,
                    viewNSFW: newSetting,
                },
            },
        }
    );
    const isSettingOn = newSetting ? "On" : "Off";
    res.status(200);
    res.json({
        message: `View NSFW setting is now turned ${isSettingOn}`,
    });
});
