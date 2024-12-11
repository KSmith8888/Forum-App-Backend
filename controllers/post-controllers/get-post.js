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
    const commentIds = requestedPost.comments;
    const relatedComments = await Comment.find({ _id: { $in: commentIds } });
    res.status(200);
    res.json({ post: requestedPost, comments: relatedComments });
});
