function sanitizeChars(req, res, next) {
    try {
        const reg = new RegExp("^[a-zA-Z0-9 .:,?/_'!@\r\n-]+$");
        if (
            (req.params.id && !reg.test(req.params.id)) ||
            (req.params.topic && !reg.test(req.params.topic)) ||
            (req.params.query && !reg.test(req.params.query)) ||
            (req.params.username && !reg.test(req.params.username))
        ) {
            throw new Error("Param text is not valid");
        }
        const bodyValues = Object.values(req.body);
        for (let value of bodyValues) {
            if (typeof value !== "string" && typeof value !== "number") {
                throw new Error("User input not valid: Not accepted type");
            }
            if (value === "") {
                value = undefined;
            }
            if (typeof value === "string") {
                if (!reg.test(value)) {
                    throw new Error("User input not valid: String input");
                }
                if (
                    value.toLowerCase().includes("data:") ||
                    value.toLowerCase().includes("javascript:")
                ) {
                    throw new Error("Value includes invalid scheme");
                }
            } else {
                if (!reg.test(value)) {
                    throw new Error("User input not valid: Number input");
                }
            }
        }
        next();
    } catch (err) {
        console.error(err.message);
        res.status(400);
        res.json({
            message: "Please do not include special characters in your request",
        });
    }
}
export { sanitizeChars };
