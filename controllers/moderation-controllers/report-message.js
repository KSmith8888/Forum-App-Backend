import { wrapper } from "../wrapper.js";
import { Report } from "../../models/report-model.js";

export const reportMessage = wrapper(async (req, res) => {
    if (
        !req.body.reportId ||
        !req.body.reportType ||
        !req.body.reportRelated ||
        !req.body.reportContent ||
        !req.body.reportUrlTitle
    ) {
        throw new Error(
            "Bad Request Error: Reported message info not provided"
        );
    }
    await Report.create({
        messageId: String(req.body.reportId),
        postUrlTitle: String(req.body.reportUrlTitle),
        messageType: String(req.body.reportType),
        messageContent: String(req.body.reportContent),
        reportedBy: String(req.username),
        relatedPost: String(req.body.reportRelated),
    });
    res.status(201);
    res.json({ message: "Message reported successfully" });
});
