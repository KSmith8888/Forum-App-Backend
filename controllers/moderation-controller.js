import { wrapper } from "./wrapper.js";
import { Report } from "../models/report-modal.js";

const reportMessage = wrapper(async (req, res) => {
    if (!req.body.id || !req.body.type) {
        throw new Error("Bad Request Error: Message id or type not provided");
    }
    await Report.create({
        messageId: String(req.body.id),
        messageType: String(req.body.type),
        reportedBy: String(req.username),
    });
    res.status(201);
    res.json({ msg: "Message reported successfully" });
});

const getReportedMessages = wrapper(async (req, res) => {
    if (req.role !== "mod" && req.role !== "admin") {
        throw new Error("User attempting to perform moderation action");
    }
    const oldestReports = await Report.find({})
        .sort({ createdAt: "asc" })
        .limit(10);
    res.status(200);
    res.json(oldestReports);
});

export { reportMessage, getReportedMessages };
