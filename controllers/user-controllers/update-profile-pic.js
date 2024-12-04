import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";

export const updateProfilePic = wrapper(async (req, res) => {
    const userId = req.userId;
    const newProfilePicName = req.body.pfpName;
    const newProfilePicAlt = req.body.pfpAlt;
    if (!newProfilePicName || !newProfilePicAlt) {
        throw new Error(
            "Bad Request Error: Picture name or alt was not provided"
        );
    }
    await User.findOneAndUpdate(
        { _id: String(userId) },
        {
            $set: {
                profileImageName: String(newProfilePicName),
                profileImageAlt: String(newProfilePicAlt),
            },
        }
    );
    res.status(200);
    res.json({
        message: "Profile picture updated successfully",
        newProfilePicName,
        newProfilePicAlt,
    });
});
