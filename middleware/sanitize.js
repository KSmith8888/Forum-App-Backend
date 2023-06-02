function sanitizeChars(req, res, next) {
    try {
        const reg = new RegExp("^[a-zA-Z0-9 .:,!-]+$", "m");
        if (
            (req.params.id && !reg.test(req.params.id)) ||
            (req.params.topic && !reg.test(req.params.topic)) ||
            (req.params.query && !reg.test(req.params.query))
        ) {
            throw new Error("Param text not valid");
        }
        const bodyValues = Object.values(req.body);
        for (let value of bodyValues) {
            if (Array.isArray(value)) {
                value.forEach((str) => {
                    if (!reg.test(str)) {
                        throw new Error("User input not valid");
                    }
                });
            } else if (!reg.test(value)) {
                throw new Error("User input not valid");
            }
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(400);
        res.json({
            msg: "Please do not include special characters in your request",
        });
    }
}
export { sanitizeChars };
