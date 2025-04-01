import express from "express";

import { getUserWarnings } from "../controllers/moderation-controllers/get-user-warnings.js";
import { getReportedMessages } from "../controllers/moderation-controllers/get-reported-messages.js";
import { sendUserNotification } from "../controllers/moderation-controllers/send-user-notification.js";
import { banUser } from "../controllers/moderation-controllers/ban-user.js";
import { reportMessage } from "../controllers/moderation-controllers/report-message.js";
import { changeAccountRole } from "../controllers/moderation-controllers/change-account-role.js";
import { deleteUsersPost } from "../controllers/moderation-controllers/delete-users-post.js";
import { deleteUsersComment } from "../controllers/moderation-controllers/delete-users-comment.js";
import { deleteUsersAccount } from "../controllers/moderation-controllers/delete-users-account.js";
import { deleteReport } from "../controllers/moderation-controllers/delete-report.js";
import { optionsPreflight } from "../controllers/options-preflight.js";
import { sanitizeChars } from "../middleware/sanitize.js";
import { authorizeUser } from "../middleware/authorize.js";
import { checkIfBanned } from "../middleware/ban-status.js";

const moderationRouter = express.Router();

moderationRouter.options("/*wildcard", optionsPreflight);
moderationRouter.get(
    "/report",
    sanitizeChars,
    authorizeUser,
    getReportedMessages
);
moderationRouter.get(
    "/notifications/:username",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    getUserWarnings
);
moderationRouter.post("/report", sanitizeChars, authorizeUser, reportMessage);
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
moderationRouter.patch(
    "/profile/:username/role",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    changeAccountRole
);
moderationRouter.delete(
    "/report/:id",
    sanitizeChars,
    authorizeUser,
    checkIfBanned,
    deleteReport
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
