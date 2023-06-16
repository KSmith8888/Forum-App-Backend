import express from "express";

import { reportMessage } from "../controllers/moderation-controller.js";
import { optionsPreflight } from "../controllers/options-preflight.js";
import { sanitizeChars } from "../middleware/sanitize.js";

const moderationRouter = express.Router();

moderationRouter.options("*", optionsPreflight);
moderationRouter.post("/report", sanitizeChars, reportMessage);

export { moderationRouter };
