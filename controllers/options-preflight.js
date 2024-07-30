import { wrapper } from "./wrapper.js";

const optionsPreflight = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    res.header("Access-Control-Allow-Methods", "POST,OPTIONS,GET,PATCH,DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "content-type,authorization,user_id"
    );
    res.status(200);
    res.json({ message: "Preflight Passed" });
});

export { optionsPreflight };
