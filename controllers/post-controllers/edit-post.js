import { wrapper } from "../wrapper.js";
import { Post } from "../../models/post-model.js";
import { User } from "../../models/user-model.js";

export const editPost = wrapper(async (req, res) => {
    const postId = req.params.id;
    if (typeof postId !== "string") {
        throw new Error("Bad Request Error: Invalid type provided for post id");
    }
    const dbPost = await Post.findOne({ _id: String(postId) });
    if (!dbPost) {
        throw new Error("No post found matching that id");
    }
    if (dbPost.history.length > 5) {
        throw new Error("Maximum number of edits reached");
    }
    const newPostContent = req.body.content;
    if (!newPostContent || typeof newPostContent !== "string") {
        throw new Error("No post content or invalid post content was provided");
    }
    if (dbPost.postType === "Link") {
        const linkReg = new RegExp("^[a-zA-Z0-9?&=@.:/_-]+$");
        const isValid = URL.canParse(newPostContent);
        if (
            !newPostContent.startsWith("https://") ||
            !isValid ||
            !linkReg.test(newPostContent) ||
            !newPostContent.includes(".")
        ) {
            throw new Error("Bad Request Error: Invalid link provided");
        }
    }
    let pollData = [];
    if (dbPost.postType === "Poll") {
        const options = newPostContent.split(",");
        if (
            options.length < 2 ||
            options.length > 6 ||
            !strictReg.test(newPostContent)
        ) {
            throw new Error("Bad Request Error: Invalid poll data provided");
        }
        for (const option of options) {
            const trimmed = option.trim();
            if (trimmed.length < 2) {
                throw new Error(
                    "Bad Request Error: Invalid poll data provided"
                );
            }
            pollData.push({ option: trimmed, votes: 0 });
        }
    }
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const userPostIds = dbUser.posts.map((postObj) => {
        return String(postObj.postId);
    });
    if (!userPostIds.includes(postId)) {
        throw new Error("Users can only edit their own posts");
    }
    const prevPostHistory = dbPost.history || [];
    const prevPostContent = dbPost.content;
    const currentDate = new Date().toUTCString();
    const prevTimestamp =
        dbPost.lastEditedAt === "unedited"
            ? String(dbPost.createdAt)
            : String(dbPost.lastEditedAt);
    const prevPostVersion = {
        content: prevPostContent,
        timestamp: prevTimestamp,
        editNumber: dbPost.history.length + 1,
    };
    const preview =
        newPostContent.length < 50
            ? newPostContent
            : `${newPostContent.substring(0, 50)}...`;
    const newUserPosts = dbUser.posts.map((postObj) => {
        if (String(postObj.postId) === postId) {
            return {
                title: dbPost.title,
                previewText: preview,
                urlTitle: dbPost.urlTitle,
                postId: postId,
            };
        } else {
            return postObj;
        }
    });
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                posts: newUserPosts,
            },
        }
    );
    await Post.findOneAndUpdate(
        { _id: String(postId) },
        {
            $set: {
                content: String(newPostContent),
                previewText: String(preview),
                hasBeenEdited: true,
                lastEditedAt: String(currentDate),
                history: [...prevPostHistory, prevPostVersion],
                pollData: pollData,
            },
        }
    );
    res.status(200);
    res.json({ message: "Post edited successfully" });
});
