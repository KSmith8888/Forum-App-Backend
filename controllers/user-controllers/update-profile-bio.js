import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";

export const updateProfileBio = wrapper(async (req, res) => {
    const userId = req.userId;
    const newBio = req.body.bioContent;
    if (!newBio) {
        throw new Error("Must provide new bio content");
    }
    await User.findOneAndUpdate(
        { _id: String(userId) },
        {
            $set: {
                profileBio: newBio,
            },
        }
    );
    const currentDate = Date.now();
    res.status(200);
    res.json({
        message: `Bio updated successfully-Target ID-${currentDate}`,
    });
});
