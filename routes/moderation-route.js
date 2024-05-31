import express from "express";

import {
    sendUserNotification,
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

const moderationRouter = express.Router();

moderationRouter.options("*", optionsPreflight);
moderationRouter.get(
    "/report",
    sanitizeChars,
    authorizeUser,
    getReportedMessages
);
moderationRouter.post("/report", sanitizeChars, authorizeUser, reportMessage);
moderationRouter.post(
    "/notifications/:username",
    sanitizeChars,
    authorizeUser,
    sendUserNotification
);
moderationRouter.delete(
    "/report/:id",
    sanitizeChars,
    authorizeUser,
    deleteReport
);
moderationRouter.patch(
    "/profile/:username/role",
    sanitizeChars,
    authorizeUser,
    changeAccountRole
);
moderationRouter.delete(
    "/posts/:id",
    sanitizeChars,
    authorizeUser,
    deleteUsersPost
);
moderationRouter.delete(
    "/comments/:id",
    sanitizeChars,
    authorizeUser,
    deleteUsersComment
);
moderationRouter.delete(
    "/profile/:username",
    sanitizeChars,
    authorizeUser,
    deleteUsersAccount
);

export { moderationRouter };
