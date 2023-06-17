import express from "express";

import {
    reportMessage,
    getReportedMessages,
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

export { moderationRouter };
