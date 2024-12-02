import { wrapper } from "../wrapper.js";
import { Post } from "../../models/post-model.js";

export const getHomePosts = wrapper(async (req, res) => {
    const popularFull = await Post.find({ user: { $ne: "Deleted" } })
        .sort({ likes: "desc" })
        .limit(10);
    const pinned = await Post.find({
        user: { $ne: "Deleted" },
        isPinned: true,
    }).limit(10);
    if (pinned.length > 0) {
        pinned.forEach((post) => {
            popularFull.unshift(post);
        });
    }
    const popularTen = popularFull.slice(0, 10);
    const popularPosts = popularTen.map((post) => {
        return {
            postId: post._id,
            title: post.title,
            previewText: post.previewText,
            postType: post.postType,
            urlTitle: post.urlTitle,
        };
    });
    const newFull = await Post.find({ user: { $ne: "Deleted" } })
        .sort({ createdAt: "desc" })
        .limit(10);
    const newPosts = newFull.map((post) => {
        return {
            postId: post._id,
            title: post.title,
            previewText: post.previewText,
            postType: post.postType,
            urlTitle: post.urlTitle,
        };
    });
    res.status(200);
    res.json({ popular: popularPosts, new: newPosts });
});
