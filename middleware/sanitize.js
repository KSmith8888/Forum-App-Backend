function sanitizeChars(req, res, next) {
    try {
        const reg = new RegExp("^[a-zA-Z0-9 .:,?/_'!-]+$", "m");
        if (
            (req.params.id && !reg.test(req.params.id)) ||
            (req.params.topic && !reg.test(req.params.topic)) ||
            (req.params.query && !reg.test(req.params.query))
        ) {
            throw new Error("Param text is not valid");
        }
        const bodyValues = Object.values(req.body);
        for (let value of bodyValues) {
            if (typeof value !== "string" && typeof value !== "object") {
                throw new Error("User input not valid: Not accepted type");
            }
            if (value === "") {
                value = undefined;
            }
            if (typeof value === "object" && !Array.isArray(value)) {
                throw new Error("User input not valid: Non-array object");
            }
            if (Array.isArray(value)) {
                value.forEach((str) => {
                    if (!reg.test(str)) {
                        throw new Error("User input not valid: Array input");
                    }
                });
            } else if (typeof value === "string" && !reg.test(value)) {
                throw new Error("User input not valid: String input");
            }
        }
        next();
    } catch (err) {
        console.error(err.message);
        res.status(400);
        res.json({
            msg: "Please do not include special characters in your request",
        });
    }
}
export { sanitizeChars };
