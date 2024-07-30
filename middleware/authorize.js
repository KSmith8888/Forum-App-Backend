import jwt from "jsonwebtoken";

import { User } from "../models/user-model.js";

async function authorizeUser(req, res, next) {
    try {
        if (!req.headers.authorization) {
            throw new Error(
                "Authorization Error: No authorization header present"
            );
        }
        const authHeader = req.headers.authorization.split(" ");
        if (authHeader[0] !== "Bearer") {
            throw new Error(
                "Authorization Error: Does not match required scheme"
            );
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
        req.userId = String(decodedClient.id);
        req.role = String(decodedClient.role);
        req.username = String(decodedClient.username);
        next();
    } catch (err) {
        console.error(err.message);
        if (err.message.startsWith("Authorization Error:")) {
            res.status(401);
            res.json({
                message: "You must log in before performing that action",
            });
        } else if (err.message === "jwt expired") {
            res.status(401);
            res.json({
                message:
                    "You have been automatically logged out, please log back in to access this resource",
            });
        } else if (err.message.startsWith("Credential Error:")) {
            res.status(400);
            res.json({
                message: "Provided credentials do not match",
            });
        } else {
            res.status(500);
            res.json({
                message: "There has been an error, please try again later",
            });
        }
    }
}

export { authorizeUser };
