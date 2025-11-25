import "dotenv/config";
import ExpressConfig from "./server/express.config.js";
import middlewareConfig from "./server/middleware.config.js";
import routeConfig from "./server/route.config.js";
import { connectAllDb } from "./utils/connectionManager.js";

const app = ExpressConfig();

// middlewareConfig(app);
routeConfig(app);

const PORT = process.env.APP_PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Multi Tenant Backend running on port ${PORT}`);
    // Initialize database connections
    try {
        await connectAllDb();
        console.log("All database connections initialized");
    } catch (error) {
        console.error("Error initializing database connections:", error);
        process.exit(1);
    }
});