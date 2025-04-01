import express from "express";

import { optionsPreflight } from "../controllers/options-preflight.js";
import { getOwnProfile } from "../controllers/user-controllers/get-own-profile.js";
import { getUserProfile } from "../controllers/user-controllers/get-users-profile.js";
import { createNewUser } from "../controllers/user-controllers/create-new-user.js";
import { registerUser } from "../controllers/user-controllers/register-user.js";
import { attemptLogin } from "../controllers/user-controllers/attempt-login.js";
import { resetPassword } from "../controllers/user-controllers/reset-password.js";
import { completeReset } from "../controllers/user-controllers/complete-reset.js";
import { updateProfilePic } from "../controllers/user-controllers/update-profile-pic.js";
import { updateProfileBio } from "../controllers/user-controllers/update-profile-bio.js";
import { updatePassword } from "../controllers/user-controllers/update-password.js";
import { updateEmail } from "../controllers/user-controllers/update-email.js";
import { completeEmailUpdate } from "../controllers/user-controllers/complete-email-update.js";
import { updateReplySetting } from "../controllers/user-controllers/update-reply-setting.js";
import { updateNsfwSetting } from "../controllers/user-controllers/update-nsfw-setting.js";
import { deleteOwnAccount } from "../controllers/user-controllers/delete-own-account.js";
import { deleteNotification } from "../controllers/user-controllers/delete-notification.js";
import { sanitizeChars } from "../middleware/sanitize.js";
import { authorizeUser } from "../middleware/authorize.js";
import { checkIfBanned } from "../middleware/ban-status.js";

const usersRouter = express.Router();

usersRouter.options("/*wildcard", optionsPreflight);
usersRouter.get("/details/:username", sanitizeChars, getUserProfile);
usersRouter.get(
    "/profile/details",
    sanitizeChars,
    authorizeUser,
    getOwnProfile
);
usersRouter.post("/", sanitizeChars, createNewUser);
usersRouter.post("/register", sanitizeChars, registerUser);
usersRouter.post("/login", sanitizeChars, attemptLogin);
usersRouter.post("/reset", sanitizeChars, resetPassword);
usersRouter.post("/reset/complete", sanitizeChars, completeReset);
usersRouter.patch(
    "/profile/image",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    updateProfilePic
);
usersRouter.patch(
    "/profile/bio",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    updateProfileBio
);
usersRouter.patch(
    "/profile/password",
    sanitizeChars,
    authorizeUser,
    updatePassword
);
usersRouter.patch("/profile/email", sanitizeChars, authorizeUser, updateEmail);
usersRouter.patch(
    "/profile/email/complete",
    sanitizeChars,
    authorizeUser,
    completeEmailUpdate
);
usersRouter.patch(
    "/profile/notifications",
    sanitizeChars,
    authorizeUser,
    updateReplySetting
);
usersRouter.patch(
    "/profile/nsfw",
    sanitizeChars,
    authorizeUser,
    updateNsfwSetting
);
usersRouter.delete("/profile", sanitizeChars, authorizeUser, deleteOwnAccount);
usersRouter.delete(
    "/profile/notifications/:id",
    sanitizeChars,
    authorizeUser,
    deleteNotification
);

export { usersRouter };
