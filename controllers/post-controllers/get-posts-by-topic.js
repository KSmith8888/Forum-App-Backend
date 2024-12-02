import { wrapper } from "../wrapper.js";
import { Post } from "../../models/post-model.js";

export const getPostsByTopic = wrapper(async (req, res) => {
    const postsTopic = req.params.topic.toLowerCase();
    const topicResults = await Post.find({
        topic: String(postsTopic),
        user: { $ne: "Deleted" },
    }).limit(20);
    const topicPosts = topicResults.map((post) => {
        return {
            postId: post._id,
            title: post.title,
            previewText: post.previewText,
            postType: post.postType,
            urlTitle: post.urlTitle,
        };
    });
    res.status(200);
    res.json(topicPosts);
});
