import express from "express";

import { optionsPreflight } from "../controllers/options-preflight.js";
import {
    createNewUser,
    updateProfilePic,
    deleteOwnAccount,
} from "../controllers/users-controller.js";
import { sanitizeChars } from "../middleware/sanitize.js";
import { authorizeUser } from "../middleware/authorize.js";

const usersRouter = express.Router();

usersRouter.options("*", optionsPreflight);
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

export { usersRouter };
