import { wrapper } from "./wrapper.js";
import { Post } from "../models/post-model.js";
import { User } from "../models/user-model.js";
import { Comment } from "../models/comment-model.js";
import { Notification } from "../models/notification-model.js";

const createPost = wrapper(async (req, res) => {
    const topic = req.body.topic.toLowerCase();
    const title = req.body.title;
    const content = req.body.content;
    const postType = req.body.postType;
    const isPinned = req.body.isPinned ? true : false;
    if (
        !topic ||
        !title ||
        !content ||
        !postType ||
        typeof content !== "string"
    ) {
        throw new Error(
            "Bad Request Error: Topic, title or content not provided"
        );
    }
    if (isPinned && req.role !== "admin") {
        throw new Error(
            "Bad Request Error: Only admins are allowed to pin posts"
        );
    }
    if (postType !== "Text" && postType !== "Link") {
        throw new Error("Bad Request Error: Post type is not valid");
    }
    if (postType === "Link") {
        const reg = new RegExp("^[a-zA-Z0-9.:/_-]+$");
        const isValid = URL.canParse(content);
        if (
            !isValid ||
            !reg.test(content) ||
            !content.startsWith("https://") ||
            !content.includes(".")
        ) {
            throw new Error("Bad Request Error: Invalid link provided");
        }
    }
    const initialKeywords = req.body.keywords
        ? req.body.keywords.split(" ")
        : [];
    const keywords = initialKeywords.map((keyword) => keyword.toLowerCase());
    const allowedTopics = [
        "programming",
        "politics",
        "space",
        "news",
        "movies",
        "books",
        "games",
        "other",
    ];
    if (!allowedTopics.includes(topic)) {
        throw new Error("Bad Request Error: Topic not allowed");
    }
    keywords.push(topic);
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (dbUser.posts.length > 100) {
        throw new Error("Limit Exceeded Error: Post limit exceeded");
    }
    keywords.push(dbUser.username);
    const dbPost = await Post.create({
        title: String(title),
        postType: String(postType),
        content: String(content),
        isPinned,
        topic: String(topic),
        user: dbUser.displayName,
        keywords: keywords,
        profileImageName: dbUser.profileImageName,
        profileImageAlt: dbUser.profileImageAlt,
    });

    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                posts: [
                    { postId: dbPost.id, title: dbPost.title },
                    ...dbUser.posts,
                ],
            },
        }
    );
    res.status(201);
    res.json(dbPost);
});

const getPost = wrapper(async (req, res) => {
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

const getPostsByTopic = wrapper(async (req, res) => {
    const postsTopic = req.params.topic.toLowerCase();
    const requestedPost = await Post.find({
        topic: String(postsTopic),
        user: { $ne: "Deleted" },
    }).limit(20);
    res.status(200);
    res.json(requestedPost);
});

const getPostsByUser = wrapper(async (req, res) => {
    const userId = req.params.id;
    const dbUser = await User.findOne({ _id: String(userId) });
    if (!dbUser) {
        throw new Error("No user account found, it may have been deleted");
    }
    res.status(200);
    res.json({ posts: dbUser.posts, comments: dbUser.comments });
});

const getPostsByQuery = wrapper(async (req, res) => {
    let query = req.params.query;
    if (!query || typeof query !== "string") {
        throw new Error("User did not submit a valid query");
    }
    query = query.toLowerCase();
    let results = [];
    if (!query.includes(" ")) {
        const singleResult = await Post.find({ keywords: String(query) }).limit(
            20
        );
        results = singleResult;
    } else {
        const splitQuery = query.split(" ");
        const firstResult = await Post.find({
            keywords: String(splitQuery[0]),
        }).limit(20);
        const secondResult = await Post.find({
            keywords: String(splitQuery[1]),
        }).limit(20);
        results = [...firstResult, ...secondResult];
    }
    res.status(200);
    res.json(results);
});

const getHomePosts = wrapper(async (req, res) => {
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
            _id: post._id,
            title: post.title,
            content: post.content,
            postType: post.postType,
        };
    });
    const newFull = await Post.find({ user: { $ne: "Deleted" } })
        .sort({ createdAt: "desc" })
        .limit(10);
    const newPosts = newFull.map((post) => {
        return {
            _id: post._id,
            title: post.title,
            content: post.content,
            postType: post.postType,
        };
    });
    res.status(200);
    res.json({ popular: popularPosts, new: newPosts });
});

const likePost = wrapper(async (req, res) => {
    const postId = req.params.id;
    const dbUser = await User.findOne({ _id: String(req.userId) });
    //Did user like post or unlike
    let didUserLike = true;
    let newLikedPosts = [];
    if (dbUser.likedPosts.includes(postId)) {
        didUserLike = false;
        newLikedPosts = dbUser.likedPosts.filter((id) => {
            return id !== postId;
        });
    } else {
        newLikedPosts = [...dbUser.likedPosts, postId];
    }
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                likedPosts: newLikedPosts,
            },
        }
    );

    const dbPost = await Post.findOne({ _id: String(postId) });
    const numberOfLikes = didUserLike ? dbPost.likes + 1 : dbPost.likes - 1;
    await Post.findOneAndUpdate(
        { _id: dbPost._id },
        {
            $set: {
                likes: numberOfLikes,
            },
        }
    );
    if (
        didUserLike &&
        (dbPost.likes === 5 || dbPost.likes === 10 || dbPost.likes === 25)
    ) {
        const postCreatorUsername = dbPost.user.toLowerCase();
        const dbPostCreator = await User.findOne({
            username: postCreatorUsername,
        });
        const newNotification = await Notification.create({
            message: `Your post, ${dbPost.title}, has ${dbPost.likes} likes`,
            type: "Achievement",
        });
        await User.findOneAndUpdate(
            { username: postCreatorUsername },
            {
                $set: {
                    notifications: [
                        ...dbPostCreator.notifications,
                        newNotification._id,
                    ],
                },
            }
        );
    }
    res.status(200);
    res.json({
        status: "Post liked successfully",
        likes: numberOfLikes,
        didUserLike,
        likePostId: req.params.id,
    });
});

const savePost = wrapper(async (req, res) => {
    const postId = req.params.id;
    const postTitle = req.body.postTitle;
    const dbUser = await User.findOne({ _id: String(req.userId) });
    //Did user save post or unsave
    let didUserSave = true;
    let newSavedPosts = [];
    dbUser.savedPosts.forEach((savedPost) => {
        if (savedPost.postId === postId) {
            didUserSave = false;
        } else {
            newSavedPosts.push(savedPost);
        }
    });
    if (didUserSave) {
        newSavedPosts = [
            { postId: postId, title: postTitle },
            ...newSavedPosts,
        ];
    }
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                savedPosts: newSavedPosts,
            },
        }
    );
    res.status(200);
    res.json({
        message: "Post saved successfully",
        didUserSave,
        postId,
    });
});

const editPost = wrapper(async (req, res) => {
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
    if (!newPostContent) {
        throw new Error("No post content was provided");
    }
    if (dbPost.postType === "Link") {
        if (
            !newPostContent.startsWith("https://") ||
            newPostContent.includes(" ")
        ) {
            throw new Error("Bad Request Error: Cannot change post type");
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
    const prevTimestamp =
        dbPost.createdAt !== dbPost.lastEditedAt
            ? dbPost.lastEditedAt
            : dbPost.createdAt;
    const prevPostVersion = {
        content: prevPostContent,
        timestamp: prevTimestamp,
        editNumber: dbPost.history.length + 1,
    };
    const newUserPosts = dbUser.posts.map((postObj) => {
        if (String(postObj.postId) === postId) {
            return { title: dbPost.title, postId: postId };
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
                hasBeenEdited: true,
                lastEditedAt: new Date(),
                history: [...prevPostHistory, prevPostVersion],
            },
        }
    );
    res.status(200);
    res.json({ message: "Post edited successfully" });
});

const deletePost = wrapper(async (req, res) => {
    const postId = req.params.id;
    const dbUser = await User.findOne({ _id: String(req.userId) });
    const userPostIds = dbUser.posts.map((postObj) => {
        return String(postObj.postId);
    });
    if (!userPostIds.includes(postId)) {
        throw new Error("Users can only delete their own posts");
    }
    await Post.findOneAndUpdate(
        { _id: String(postId) },
        {
            $set: {
                user: "Deleted",
                title: "This post has been deleted",
                content: "This post has been deleted",
                postType: "Text",
                keywords: [],
                history: [],
                hasBeenEdited: false,
                profileImageName: "blank.png",
                profileImageAlt: "A generic blank avatar image of a mans head",
            },
        }
    );
    const newUserPosts = dbUser.posts.filter((postObj) => {
        return String(postObj.postId) !== postId;
    });
    await User.findOneAndUpdate(
        { _id: String(req.userId) },
        {
            $set: {
                posts: newUserPosts,
            },
        }
    );
    res.status(200);
    res.json({ message: `Post deleted successfully-Target ID-${postId}` });
});

export {
    createPost,
    getPost,
    getHomePosts,
    getPostsByTopic,
    getPostsByUser,
    likePost,
    savePost,
    getPostsByQuery,
    editPost,
    deletePost,
};
