import { wrapper } from "../wrapper.js";
import { Comment } from "../../models/comment-model.js";
import { User } from "../../models/user-model.js";

export const editComment = wrapper(async (req, res) => {
    const commentId = req.params.id;
    if (typeof commentId !== "string") {
        throw new Error("Bad Request Error: Invalid comment id type provided");
    }
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const userCommentIds = dbUser.comments.map((comment) => {
        return String(comment.commentId);
    });
    if (!userCommentIds.includes(commentId)) {
        throw new Error("Users can only edit their own comments");
    }
    const newContent = req.body.content;
    if (!newContent) {
        throw new Error("Updated content not provided");
    }
    if (typeof newContent !== "string") {
        throw new Error("Bad Request Error: Invalid content type provided");
    }
    const dbComment = await Comment.findOne({ _id: String(commentId) });
    if (dbComment.history.length > 5) {
        throw new Error("Maximum number of edits reached");
    }
    const prevContent = dbComment.content;
    const currentDate = new Date().toUTCString();
    const prevTimestamp =
        dbComment.lastEditedAt === "unedited"
            ? String(dbComment.createdAt)
            : String(dbComment.lastEditedAt);
    const prevComment = {
        content: prevContent,
        timestamp: prevTimestamp,
        editNumber: dbComment.history.length + 1,
    };
    const prevHistory = dbComment.history || [];
    const preview =
        newContent.length <= 50
            ? newContent
            : `${newContent.substring(0, 50)}...`;
    await Comment.findOneAndUpdate(
        { _id: dbComment._id },
        {
            $set: {
                content: newContent,
                previewText: String(preview),
                hasBeenEdited: true,
                lastEditedAt: String(currentDate),
                history: [...prevHistory, prevComment],
            },
        }
    );
    const newUserComments = dbUser.comments.map((comment) => {
        if (String(comment.commentId) === commentId) {
            return {
                commentId: comment.commentId,
                previewText: String(preview),
                relatedPost: comment.relatedPost,
            };
        } else {
            return comment;
        }
    });
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
        {
            $set: {
                comments: newUserComments,
            },
        }
    );
    res.status(200);
    res.json({
        relatedPostId: dbComment.relatedPost,
        postUrlTitle: dbComment.postUrlTitle,
    });
});
