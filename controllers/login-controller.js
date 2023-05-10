import { wrapper } from "./wrapper.js";

const attemptLogin = wrapper(async (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        throw new Error("Credential Error: Username or password not provided");
    }
    res.status(200);
    res.json({ status: "Login successful" });
});

export { attemptLogin };
