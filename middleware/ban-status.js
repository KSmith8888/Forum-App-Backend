import { User } from "../models/user-model.js";

async function checkIfBanned(req, res, next) {
    try {
        const dbUser = await User.findOne({ _id: req.userId });
        if (!dbUser) {
            throw new Error(
                "Credential Error: No matching database user found"
            );
        }
        if (dbUser.isBanned) {
            const currentTime = Date.now();
            const banDiff = dbUser.endOfBan - currentTime;
            const banEndDate = new Date(dbUser.endOfBan).toDateString();
            if (typeof banDiff !== "number") {
                throw new Error("Ban Type Error: Ban time is not type number");
            }
            if (banDiff > 0) {
                throw new Error(
                    `Ban Error: Account is banned until ${banEndDate}`
                );
            } else {
                await User.findOneAndUpdate(
                    { _id: dbUser._id },
                    {
                        $set: {
                            isBanned: false,
                            endOfBan: 0,
                        },
                    }
                );
            }
        }
        next();
    } catch (err) {
        if (err.message.startsWith("Ban Error:")) {
            res.status(401);
            res.json({
                msg: err.message,
            });
        } else {
            res.status(500);
            res.json({
                msg: "There has been an error, please try again later",
            });
        }
    }
}

export { checkIfBanned };
