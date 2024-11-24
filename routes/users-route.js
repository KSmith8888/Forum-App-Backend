import express from "express";

import { optionsPreflight } from "../controllers/options-preflight.js";
import {
    getOwnProfile,
    getUserProfile,
    createNewUser,
    registerUser,
    resetPassword,
    completeReset,
    updateProfilePic,
    updateProfileBio,
    updatePassword,
    updateEmail,
    updateNotificationSetting,
    deleteOwnAccount,
    deleteNotification,
} from "../controllers/users-controller.js";
import { sanitizeChars } from "../middleware/sanitize.js";
import { authorizeUser } from "../middleware/authorize.js";
import { checkIfBanned } from "../middleware/ban-status.js";

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
usersRouter.post("/register", sanitizeChars, registerUser);
usersRouter.post("/reset", sanitizeChars, resetPassword);
usersRouter.post("/reset/complete", sanitizeChars, completeReset);
usersRouter.patch(
    "/profile/:id/image",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    updateProfilePic
);
usersRouter.patch(
    "/profile/:id/bio",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    updateProfileBio
);
usersRouter.patch(
    "/profile/:id/password",
    sanitizeChars,
    authorizeUser,
    updatePassword
);
usersRouter.patch(
    "/profile/:id/email",
    sanitizeChars,
    authorizeUser,
    updateEmail
);
usersRouter.patch(
    "/profile/:id/notifications",
    sanitizeChars,
    authorizeUser,
    updateNotificationSetting
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
