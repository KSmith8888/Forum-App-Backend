import { wrapper } from "./wrapper.js";
//import { Report } from "../models/report-modal.js";

const reportMessage = wrapper(async (req, res) => {
    console.log(req.body.id, req.body.type);
    res.status(201);
    res.json({ msg: "Message reported successfully" });
});

export { reportMessage };
