import mongoose from "mongoose";

import { app } from "./app.js";

const PORT = process.env.PORT || 3000;

async function startApp() {
    try {
        await mongoose.connect(process.env.MONGO_PRIVATE_URL);
        console.log("Connected to database");
        app.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
    }
}

startApp();
