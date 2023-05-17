import jwt from "jsonwebtoken";

import { User } from "../models/user-model.js";

async function authorizeUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization.split(" ");
        if (authHeader[0] !== "Bearer") {
            throw new Error("Does not match required scheme");
        }
        const token = authHeader[1];
        const decodedClient = jwt.verify(token, process.env.JWT_SECRET);
        const id = decodedClient.id;
        const headerId = req.headers.user_id;
        const dbUser = await User.findOne({ _id: id });
        if (!dbUser) {
            throw new Error(
                "Credential Error: No matching database user found"
            );
        }
        if (String(dbUser._id) !== headerId) {
            throw new Error("Credential Error: Header id does not match token");
        }
        req.userId = decodedClient.id;
        req.role = decodedClient.role;
        req.username = decodedClient.username;
        next();
    } catch (err) {
        console.error(err);
        res.status(500);
        res.json({
            msg: "There has been an error, please try again later",
        });
    }
}

export { authorizeUser };
