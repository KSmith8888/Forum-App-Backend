import express from "express";

import { optionsPreflight } from "../controllers/options-preflight.js";
import {
    getOwnProfile,
    getUserProfile,
    createNewUser,
    updateProfilePic,
    deleteOwnAccount,
    deleteNotification,
} from "../controllers/users-controller.js";
import { sanitizeChars } from "../middleware/sanitize.js";
import { authorizeUser } from "../middleware/authorize.js";

const usersRouter = express.Router();

usersRouter.options("*", optionsPreflight);
usersRouter.get("/details/:username", sanitizeChars, getUserProfile);
usersRouter.get(
    "/profile/details/:id",
    sanitizeChars,
    authorizeUser,
    getOwnProfile
);
usersRouter.post("/", sanitizeChars, createNewUser);
usersRouter.patch(
    "/profile/:id/image",
    sanitizeChars,
    authorizeUser,
    updateProfilePic
);
usersRouter.delete(
    "/profile/:id",
    sanitizeChars,
    authorizeUser,
    deleteOwnAccount
);
usersRouter.delete(
    "/profile/notifications/:id",
    sanitizeChars,
    authorizeUser,
    deleteNotification
);

export { usersRouter };
