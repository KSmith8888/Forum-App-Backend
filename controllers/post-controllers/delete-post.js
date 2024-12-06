import { wrapper } from "../wrapper.js";
import { Post } from "../../models/post-model.js";
import { User } from "../../models/user-model.js";

export const deletePost = wrapper(async (req, res) => {
    const postId = req.params.id;
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const userPostIds = dbUser.posts.map((postObj) => {
        return String(postObj.postId);
    });
    if (!userPostIds.includes(postId)) {
        throw new Error("Users can only delete their own posts");
    }
    await Post.findOneAndUpdate(
        { _id: String(postId) },
        {
            $set: {
                user: "Deleted",
                title: "This post has been deleted",
                content: "This post has been deleted",
                urlTitle: "post_deleted",
                previewText: "This post has been deleted",
                postType: "Text",
                keywords: [],
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            },
        }
    );
    const newUserPosts = dbUser.posts.filter((postObj) => {
        return String(postObj.postId) !== postId;
    });
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
        {
            $set: {
                posts: newUserPosts,
            },
        }
    );
    res.status(200);
    res.json({ message: `Post deleted successfully-Target ID-${postId}` });
});
