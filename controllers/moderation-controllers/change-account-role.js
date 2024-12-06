import { wrapper } from "../wrapper.js";
import { User } from "../../models/user-model.js";

export const changeAccountRole = wrapper(async (req, res) => {
    const newAccountRole = req.body.newRole;
    const accountUsername = req.params.username.toLowerCase();
    if (req.role !== "admin") {
        throw new Error(
            "Not Authorized Error: Attempt to create mod without admin access"
        );
    }
    if (!accountUsername || !newAccountRole) {
        throw new Error(
            "Bad Request Error: Account username or new role not provided"
        );
    }
    const dbAccount = await User.findOne({ username: String(accountUsername) });
    if (!dbAccount) {
        throw new Error("Not Found Error: That user does not exist");
    }
    await User.findOneAndUpdate(
        { username: String(accountUsername) },
        {
            $set: {
                role: String(newAccountRole),
            },
        }
    );
    res.status(200);
    res.json({
        message: "Account role updated successfully",
    });
});
