import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/common/db.js";

const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running at ${PORT} in ${process.env.NODE_ENV}`);
    });
};

start().catch((err) => {
    console.error("Failed to Start Server", err);
    process.exit(1);
});
