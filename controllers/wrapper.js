const wrapper = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            console.error(err.message);
            res.header(
                "Access-Control-Allow-Origin",
                process.env.FRONTEND_ORIGIN
            );
            if (err.message.startsWith("Credential Error:")) {
                res.status(401);
                res.json({
                    message: "Provided credentials do not match",
                });
            } else if (err.message.startsWith("Not Authorized Error:")) {
                res.status(403);
                res.json({
                    message: "Not authorized to perform this action",
                });
            } else if (err.message.startsWith("Not Found Error:")) {
                res.status(404);
                res.json({
                    message: "Requested data not found",
                });
            } else if (err.message.startsWith("Bad Request Error:")) {
                res.status(400);
                res.json({
                    message:
                        "Please provide all of the requested information in the correct format",
                });
            } else if (err.message.startsWith("Username unavailable Error:")) {
                res.status(400);
                res.json({
                    message:
                        "Sorry, that username is not available. Please choose a different username",
                });
            } else if (err.message.startsWith("Email Not Verified Error:")) {
                res.status(403);
                res.json({
                    message:
                        "You must verify this email address before attempting a password reset",
                });
            } else if (err.message.startsWith("Limit Exceeded Error:")) {
                res.status(429);
                res.json({
                    message: "Limit exceeded. Too many posts or comments",
                });
            } else {
                res.status(500);
                res.json({
                    message: "Please try again later",
                });
            }
        }
    };
};

export { wrapper };
