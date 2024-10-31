import express from "express";

import {
    getUserWarnings,
    sendUserNotification,
    banUser,
    reportMessage,
    getReportedMessages,
    changeAccountRole,
    deleteUsersPost,
    deleteUsersComment,
    deleteUsersAccount,
    deleteReport,
} from "../controllers/moderation-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";
import { sanitizeChars } from "../middleware/sanitize.js";
import { authorizeUser } from "../middleware/authorize.js";
import { checkIfBanned } from "../middleware/ban-status.js";

const moderationRouter = express.Router();

moderationRouter.options("*", optionsPreflight);
moderationRouter.get(
    "/report",
    sanitizeChars,
    authorizeUser,
    getReportedMessages
);
moderationRouter.post("/report", sanitizeChars, authorizeUser, reportMessage);
moderationRouter.get(
    "/notifications/:username",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    getUserWarnings
);
moderationRouter.post(
    "/notifications/:username",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    sendUserNotification
);
moderationRouter.post(
    "/ban/:username",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    banUser
);
moderationRouter.delete(
    "/report/:id",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    deleteReport
);
moderationRouter.patch(
    "/profile/:username/role",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    changeAccountRole
);
moderationRouter.delete(
    "/posts/:id",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    deleteUsersPost
);
moderationRouter.delete(
    "/comments/:id",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    deleteUsersComment
);
moderationRouter.delete(
    "/profile/:username",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    deleteUsersAccount
);

export { moderationRouter };
