import { wrapper } from "../wrapper.js";
import { Post } from "../../models/post-model.js";
import { User } from "../../models/user-model.js";

export const createPost = wrapper(async (req, res) => {
    const topic = req.body.topic.toLowerCase();
    const title = req.body.title;
    const content = req.body.content;
    const postType = req.body.postType;
    const isPinned = req.body.isPinned === "pinned" ? true : false;
    const keywordString = req.body.keywords;
    const strictReg = new RegExp("^[a-zA-Z0-9 .:,?/_'!@=%-]+$");
    if (
        !topic ||
        !title ||
        !content ||
        !postType ||
        typeof content !== "string" ||
        !strictReg.test(title)
    ) {
        throw new Error(
            "Bad Request Error: Post info not provided or not in correct format"
        );
    }
    if (isPinned && req.role !== "admin") {
        throw new Error(
            "Bad Request Error: Only admins are allowed to pin posts"
        );
    }
    if (postType !== "Text" && postType !== "Link" && postType !== "Poll") {
        throw new Error("Bad Request Error: Post type is not valid");
    }
    if (postType === "Link") {
        const linkReg = new RegExp("^[a-zA-Z0-9?&=@.:/_-]+$");
        const isValid = URL.canParse(content);
        if (
            !content.startsWith("https://") ||
            !isValid ||
            !linkReg.test(content) ||
            !content.includes(".")
        ) {
            throw new Error("Bad Request Error: Invalid link provided");
        }
    }
    let pollData = [];
    if (postType === "Poll") {
        const options = content.split(",");
        if (options.length < 2 || options.length > 4) {
            throw new Error("Bad Request Error: Invalid poll data provided");
        }
        for (const option of options) {
            pollData.push({ option: option, votes: 0 });
        }
    }
    if (keywordString && typeof keywordString !== "string") {
        throw new Error("Bad Request Error: Invalid keywords provided");
    }
    const initialKeywords =
        keywordString !== "none" ? keywordString.split(" ") : [];
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
    if (postType === "Link" && content.length > 200) {
        throw new Error("Bad Request Error: Link content limit exceeded");
    }
    const titleReg = new RegExp("^[a-zA-Z0-9_]+$");
    let fullUrlTitle = "";
    const titleChars = title.split("");
    titleChars.forEach((char) => {
        if (char === " ") {
            fullUrlTitle += "_";
        } else if (titleReg.test(char)) {
            fullUrlTitle += char;
        }
    });
    const urlTitle =
        fullUrlTitle.length > 8
            ? fullUrlTitle.slice(0, 30).toLowerCase()
            : `${topic}_post`;
    const preview =
        content.length < 50 ? content : `${content.substring(0, 50)}...`;
    const dbPost = await Post.create({
        title: String(title),
        postType: String(postType),
        content: String(content),
        urlTitle: String(urlTitle),
        previewText: String(preview),
        isPinned,
        topic: String(topic),
        user: dbUser.displayName,
        keywords: keywords,
        pollData: pollData,
        profileImageName: dbUser.profileImageName,
        profileImageAlt: dbUser.profileImageAlt,
    });

    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                posts: [
                    {
                        postId: String(dbPost._id),
                        title: dbPost.title,
                        previewText: dbPost.previewText,
                        urlTitle: dbPost.urlTitle,
                    },
                    ...dbUser.posts,
                ],
            },
        }
    );
    res.status(201);
    res.json(dbPost);
});
