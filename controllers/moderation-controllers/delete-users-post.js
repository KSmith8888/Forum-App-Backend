import { wrapper } from "../wrapper.js";
import { Post } from "../../models/post-model.js";
import { User } from "../../models/user-model.js";

export const deleteUsersPost = wrapper(async (req, res) => {
    const postId = req.params.id;
    if (!postId) {
        throw new Error("Bad Request Error: Post id not provided");
    }
    if (req.role !== "mod" && req.role !== "admin") {
        throw new Error(
            "Not Authorized Error: User attempting to mod delete post"
        );
    }
    const dbPost = await Post.findOne({ _id: String(postId) });
    if (!dbPost) {
        throw new Error("Not Found Error: No matching post found");
    }
    if (dbPost.user !== "Deleted") {
        const postCreatorName = dbPost.user.toLowerCase();
        const postCreator = await User.findOne({
            username: postCreatorName,
        });
        if (postCreator) {
            const newUserPosts = postCreator.posts.filter((post) => {
                return String(post.postId) !== postId;
            });
            await User.findOneAndUpdate(
                {
                    username: String(postCreatorName),
                },
                {
                    $set: {
                        posts: newUserPosts,
                    },
                }
            );
        }
    }

    await Post.findOneAndUpdate(
        { _id: String(postId) },
        {
            $set: {
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
            },
        }
    );
    res.status(200);
    res.json({ message: "Post deleted successfully" });
});
