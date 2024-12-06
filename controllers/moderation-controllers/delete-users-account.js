import { wrapper } from "../wrapper.js";
import { Post } from "../../models/post-model.js";
import { Comment } from "../../models/comment-model.js";
import { User } from "../../models/user-model.js";

export const deleteUsersAccount = wrapper(async (req, res) => {
    if (req.role !== "admin") {
        throw new Error("You are not authorized to perform this action");
    }
    if (!req.params.username || typeof req.params.username !== "string") {
        throw new Error("Bad Request Error: Valid username not provided");
    }
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username: username });
    if (!dbUser) {
        throw new Error(
            "Not Found Error: No user found matching those credentials"
        );
    }
    if (dbUser.role === "admin") {
        throw new Error("Admin accounts cannot be deleted");
    }
    if (dbUser.role === "mod" && role !== "admin") {
        throw new Error("Mod accounts can only be deleted by an admin");
    }
    const userPostIds = dbUser.posts.map((postObj) => {
        return postObj.id;
    });
    if (userPostIds.length > 0) {
        await Post.updateMany(
            { _id: { $in: userPostIds } },
            {
                user: "Deleted",
                postType: "Text",
                title: "This post has been deleted",
                content: "This post has been deleted",
                urlTitle: "post_deleted",
                previewText: "This post has been deleted",
                keywords: [],
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            }
        );
    }
    const userCommentIds = dbUser.comments || [];
    if (userCommentIds.length > 0) {
        await Comment.updateMany(
            { _id: { $in: userCommentIds } },
            {
                user: "Deleted",
                content: "This comment has been deleted",
                previewText: "This comment has been deleted",
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            }
        );
    }
    await User.findByIdAndDelete({ _id: dbUser._id });
    res.status(200);
    res.json({ message: "Account deleted successfully" });
});
