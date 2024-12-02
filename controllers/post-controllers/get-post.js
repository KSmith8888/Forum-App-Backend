import { wrapper } from "../wrapper.js";
import { Post } from "../../models/post-model.js";
import { Comment } from "../../models/comment-model.js";

export const getPost = wrapper(async (req, res) => {
    const postId = req.params.id;
    const requestedPost = await Post.findOne({ _id: String(postId) });
    if (!requestedPost) {
        throw new Error(
            "Not Found Error: No post found with that id, it may have been deleted"
        );
    }
    const relatedComments = [];
    const commentIds = requestedPost.comments;
    for (const id of commentIds) {
        const matching = await Comment.findOne({ _id: String(id) });
        relatedComments.push(matching);
    }
    res.status(200);
    res.json({ post: requestedPost, comments: relatedComments });
});
