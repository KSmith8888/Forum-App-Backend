import { wrapper } from "../wrapper.js";
import { Comment } from "../../models/comment-model.js";

export const getComment = wrapper(async (req, res) => {
    const commentId = req.params.id;
    const requestedComment = await Comment.findOne({ _id: String(commentId) });
    if (!requestedComment) {
        throw new Error(
            "Not Found Error: No comment found with that id, it may have been deleted"
        );
    }
    res.status(200);
    res.json({
        content: requestedComment.content,
        message: "Comment found successfully",
    });
});
