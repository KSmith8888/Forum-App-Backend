import { wrapper } from ".././wrapper.js";
import { Report } from "../../models/report-model.js";
import { User } from "../../models/user-model.js";

export const deleteReport = wrapper(async (req, res) => {
    const reportId = req.params.id;
    if (!reportId) {
        throw new Error("Bad Request Error: Report id not provided");
    }
    const dbUser = await User.findOne({ _id: String(req.userId) });
    if (dbUser.role !== "mod" && dbUser.role !== "admin") {
        throw new Error(
            "Not Authorized Error: User attempting to delete report"
        );
    }
    await Report.findByIdAndDelete({ _id: String(reportId) });
    res.status(200);
    res.json({ message: "Report deleted successfully" });
});
