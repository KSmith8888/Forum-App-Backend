import { wrapper } from "../wrapper.js";
import { Comment } from "../../models/comment-model.js";
import { User } from "../../models/user-model.js";

export const deleteComment = wrapper(async (req, res) => {
    const commentId = req.params.id;
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const userCommentIds = dbUser.comments.map((comment) => {
        return String(comment.commentId);
    });
    if (!userCommentIds.includes(commentId)) {
        throw new Error("Users can only delete their own comments");
    }
    const newUserComments = dbUser.comments.filter((comment) => {
        return String(comment.commentId) !== commentId;
    });
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
        {
            $set: {
                comments: newUserComments,
            },
        }
    );
    await Comment.findOneAndUpdate(
        { _id: String(commentId) },
        {
            $set: {
                user: "Deleted",
                content: "This comment has been deleted",
                previewText: "This comment has been deleted",
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            },
        }
    );
    res.status(200);
    res.json({
        message: `Comment deleted successfully-Target ID-${commentId}`,
    });
});
