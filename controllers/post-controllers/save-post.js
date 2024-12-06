import { wrapper } from "../wrapper.js";
import { User } from "../../models/user-model.js";

export const savePost = wrapper(async (req, res) => {
    const postId = req.params.id;
    const postTitle = req.body.postTitle;
    const postUrlTitle = req.body.urlTitle;
    const dbUser = await User.findOne({ _id: String(req.userId) });
    //Did user save post or unsave
    let didUserSave = true;
    let newSavedPosts = [];
    dbUser.savedPosts.forEach((savedPost) => {
        if (savedPost.postId === postId) {
            didUserSave = false;
        } else {
            newSavedPosts.push(savedPost);
        }
    });
    if (didUserSave) {
        newSavedPosts = [
            { postId: postId, title: postTitle, urlTitle: postUrlTitle },
            ...newSavedPosts,
        ];
    }
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                savedPosts: newSavedPosts,
            },
        }
    );
    res.status(200);
    res.json({
        message: "Post saved successfully",
        didUserSave,
        postId,
    });
});
