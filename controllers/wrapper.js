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
                    msg: "Provided credentials do not match",
                });
            } else if (err.message.startsWith("Not Found Error:")) {
                res.status(404);
                res.json({
                    msg: "Requested data not found",
                });
            } else if (err.message.startsWith("Bad Request Error:")) {
                res.status(400);
                res.json({
                    msg: "Please provide all of the requested information in the correct format",
                });
            } else if (err.message.startsWith("Username unavailable Error:")) {
                res.status(400);
                res.json({
                    msg: "Sorry, that username is not available. Please choose a different username",
                });
            } else {
                res.status(500);
                res.json({
                    msg: "There has been an error, please try again later",
                });
            }
        }
    };
};

export { wrapper };
