import { app } from "./app.js";

const PORT = process.env.PORT || 3000;

async function startApp() {
    try {
        app.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
    }
}

startApp();
