import { wrapper } from "../wrapper.js";
import { Post } from "../../models/post-model.js";

export const getPostsByQuery = wrapper(async (req, res) => {
    if (!req.params.query || typeof req.params.query !== "string") {
        throw new Error("User did not submit a valid query");
    }
    const query = req.params.query.toLowerCase();
    const matchingResults = await Post.find({ keywords: String(query) }).limit(
        20
    );
    const matchingPosts = matchingResults.map((post) => {
        return {
            postId: post._id,
            title: post.title,
            previewText: post.previewText,
            postType: post.postType,
            urlTitle: post.urlTitle,
        };
    });
    res.status(200);
    res.json(matchingPosts);
});
