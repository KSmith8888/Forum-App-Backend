import { wrapper } from "../wrapper.js";
import { Post } from "../../models/post-model.js";
import { User } from "../../models/user-model.js";
import { Notification } from "../../models/notification-model.js";

export const likePost = wrapper(async (req, res) => {
    const postId = req.params.id;
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (dbUser.likedPosts.length > 50) {
        throw new Error("Limit Exceeded Error: Liked post limit exceeded");
    }
    //Did user like post or unlike
    let didUserLike = true;
    let newLikedPosts = [];
    if (dbUser.likedPosts.includes(postId)) {
        didUserLike = false;
        newLikedPosts = dbUser.likedPosts.filter((id) => {
            return id !== postId;
        });
    } else {
        newLikedPosts = [...dbUser.likedPosts, postId];
    }
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                likedPosts: newLikedPosts,
            },
        }
    );

    const dbPost = await Post.findOne({ _id: String(postId) });
    const numberOfLikes = didUserLike ? dbPost.likes + 1 : dbPost.likes - 1;
    await Post.findOneAndUpdate(
        { _id: dbPost._id },
        {
            $set: {
                likes: numberOfLikes,
            },
        }
    );
    if (
        didUserLike &&
        (numberOfLikes === 5 || numberOfLikes === 10 || numberOfLikes === 25)
    ) {
        const postCreatorUsername = dbPost.user.toLowerCase();
        const dbPostCreator = await User.findOne({
            username: postCreatorUsername,
        });
        const newNotification = await Notification.create({
            message: `Your post has ${numberOfLikes} likes`,
            type: "Achievement",
            relatedPostId: String(dbPost._id),
        });
        await User.findOneAndUpdate(
            { username: postCreatorUsername },
            {
                $set: {
                    notifications: [
                        ...dbPostCreator.notifications,
                        newNotification._id,
                    ],
                },
            }
        );
    }
    res.status(200);
    res.json({
        status: "Post liked successfully",
        likes: numberOfLikes,
        didUserLike,
        likePostId: req.params.id,
    });
});
