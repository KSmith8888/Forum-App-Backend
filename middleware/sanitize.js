function sanitizeChars(req, res, next) {
    try {
        const reg = new RegExp("^[a-zA-Z0-9 .:,?/_'!@\r\n-]+$");
        const paramReg = new RegExp("^[a-zA-Z0-9 _]+$");
        if (
            (req.params.id && !paramReg.test(req.params.id)) ||
            (req.params.topic && !paramReg.test(req.params.topic)) ||
            (req.params.query && !paramReg.test(req.params.query)) ||
            (req.params.username && !paramReg.test(req.params.username))
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
                if (value.includes("https://")) {
                    const attemptedLinks = [];
                    const contentWords = value.split(" ");
                    const reg = new RegExp("^[a-zA-Z0-9.:/_-]+$");
                    contentWords.forEach((word) => {
                        if (word.startsWith("https://")) {
                            attemptedLinks.push(word);
                        }
                    });
                    attemptedLinks.forEach((link) => {
                        const isValid = URL.canParse(link);
                        if (
                            !isValid ||
                            !reg.test(link) ||
                            !link.includes(".")
                        ) {
                            throw new Error(
                                "Bad Request Error: Invalid link content provided"
                            );
                        }
                    });
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
