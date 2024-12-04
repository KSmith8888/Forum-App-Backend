import { User } from "../../models/user-model.js";
import { wrapper } from "../wrapper.js";

export const getUserProfile = wrapper(async (req, res) => {
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username: String(username) });
    if (!dbUser) {
        throw new Error("Not Found Error: No user found with that username");
    }
    res.status(200);
    res.json({
        username: dbUser.displayName,
        posts: dbUser.posts,
        comments: dbUser.comments,
        bio: dbUser.profileBio,
        image: dbUser.profileImageName,
        alt: dbUser.profileImageAlt,
    });
});
