import { wrapper } from "../wrapper.js";
import { Comment } from "../../models/comment-model.js";
import { User } from "../../models/user-model.js";

export const deleteUsersComment = wrapper(async (req, res) => {
    const commentId = req.params.id;
    if (!commentId) {
        throw new Error("Bad Request Error: Post id not provided");
    }
    if (req.role !== "mod" && req.role !== "admin") {
        throw new Error(
            "Not Authorized Error: User attempting to mod delete comment"
        );
    }
    const dbComment = await Comment.findOne({ _id: String(commentId) });
    if (!dbComment) {
        throw new Error("Not Found Error: No matching comment found");
    }
    if (dbComment.user !== "Deleted") {
        const commentCreatorName = dbComment.user.toLowerCase();
        const commentCreator = await User.findOne({
            username: commentCreatorName,
        });
        if (commentCreator) {
            const newUserComments = commentCreator.comments.filter(
                (comment) => {
                    return String(comment.commentId) !== commentId;
                }
            );
            await User.findOneAndUpdate(
                {
                    username: String(commentCreatorName),
                },
                {
                    $set: {
                        comments: newUserComments,
                    },
                }
            );
        }
    }

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
    res.json({ message: "Comment deleted successfully" });
});
