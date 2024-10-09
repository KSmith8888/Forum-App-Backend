function sanitizeChars(req, res, next) {
    try {
        const reg = new RegExp("^[a-zA-Z0-9 .:,?/_'!@=%\r\n-]+$");
        const paramReg = new RegExp("^[a-zA-Z0-9 _]+$");
        const paramValues = Object.values(req.params);
        for (const param of paramValues) {
            if (typeof param !== "string" || !paramReg.test(param)) {
                throw new Error("Param text is not valid");
            }
        }
        const bodyValues = Object.values(req.body);
        for (let value of bodyValues) {
            if (typeof value !== "string" && typeof value !== "number") {
                throw new Error("User input not valid: Not accepted type");
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
