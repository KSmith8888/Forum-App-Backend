import { wrapper } from "../wrapper.js";
import { Report } from "../../models/report-model.js";

export const getReportedMessages = wrapper(async (req, res) => {
    if (req.role !== "mod" && req.role !== "admin") {
        throw new Error("User attempting to perform moderation action");
    }
    const oldestReports = await Report.find({})
        .sort({ createdAt: "asc" })
        .limit(10);
    res.status(200);
    res.json(oldestReports);
});
