const loginOptions = async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST,OPTIONS,GET");
    res.header("Access-Control-Allow-Headers", "content-type");
    res.status(200);
    res.json({ msg: "Preflight Passed" });
};

const attemptLogin = async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
        const username = req.body.username;
        const password = req.body.password;
        if (!username || !password) {
            throw new Error("Username or password not provided");
        }
        res.status(200);
        res.json({ status: "Login successful" });
    } catch (error) {
        console.log(error);
        res.status(500);
        res.json({ message: "There was an error processing your request" });
    }
};

export { loginOptions, attemptLogin };
