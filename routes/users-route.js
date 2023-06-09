import express from "express";

import { optionsPreflight } from "../controllers/options-preflight.js";
import {
    createNewUser,
    changeRoleToMod,
    updateProfilePic,
    deleteOwnAccount,
    deleteUsersAccount,
} from "../controllers/users-controller.js";
import { sanitizeChars } from "../middleware/sanitize.js";
import { authorizeUser } from "../middleware/authorize.js";

const usersRouter = express.Router();

usersRouter.options("*", optionsPreflight);
usersRouter.post("/", sanitizeChars, createNewUser);
usersRouter.patch(
    "/profile/:username/role",
    sanitizeChars,
    authorizeUser,
    changeRoleToMod
);
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
    "/moderation/profile/:username",
    sanitizeChars,
    authorizeUser,
    deleteUsersAccount
);

export { usersRouter };
