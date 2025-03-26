import { wrapper } from "../wrapper.js";
import { Post } from "../../models/post-model.js";
import { User } from "../../models/user-model.js";

export const voteInPoll = wrapper(async (req, res) => {
    const pollVote = req.body.pollVote;
    const postId = req.params.id;
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (dbUser.votedPosts.includes(postId)) {
        throw new Error(
            "Poll multiple vote Error: Multiple votes on same poll"
        );
    }
    if (!pollVote) {
        throw new Error("Bad Request Error: No vote data provided");
    }
    const voteIndex = parseInt(pollVote, 10);
    if (typeof voteIndex !== "number" || voteIndex < 0 || voteIndex > 6) {
        throw new Error("Bad Request Error: Invalid vote data provided");
    }
    const dbPost = await Post.findOne({ _id: String(postId) });
    if (!dbPost || dbPost.postType !== "Poll") {
        throw new Error("No poll post found matching that id");
    }
    const voteOption = dbPost.pollData[voteIndex];
    if (!voteOption) {
        throw new Error("Bad Request Error: Invalid vote data provided");
    }
    const newTotal = (voteOption.votes += 1);
    const newPollData = dbPost.pollData.map((voteOption, index) => {
        if (index === voteIndex) {
            return {
                option: voteOption.option,
                votes: newTotal,
            };
        } else {
            return voteOption;
        }
    });
    await Post.findOneAndUpdate(
        { _id: String(postId) },
        {
            $set: {
                pollData: newPollData,
            },
        }
    );
    await User.findOneAndUpdate(
        { _id: dbUser._id },
        {
            $set: {
                votedPosts: [...dbUser.votedPosts, postId],
            },
        }
    );
    res.status(200);
    res.json({
        message: "Voted in poll successfully",
    });
});
