import mongoose from "mongoose";
import TenantSchema from "../schema/tenant";
import TenantUserSchema from "../schema/tenantUser";
import UsersSchema from "../schema/users";

const clientOption = {
    socketTimeoutMS: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

// Log MongoDB queries
mongoose.set("debug", true);

const initAdminDbConnection = async (
    DB_URL
) => {
    try {
        const db = mongoose.createConnection(DB_URL, clientOption);

        db.on("error", (err) =>
            console.log("Admin db error: ", err)
        );

        db.once("open", () => {
            console.log("Admin client MongoDB Connection ok!");
        });

        await db.model("tenants", TenantSchema);
        await db.model(
            "tenantusers",
            TenantUserSchema
        );

        return db;
    } catch (error) {
        return error;
    }
};

const initTenantDBConnection = async (
    DB_URL,
    dbName
) => {
    try {
        const db = mongoose.createConnection(DB_URL, clientOption);

        db.on("error", (err) =>
            console.log(`Tenant ${dbName} db error: `, err)
        );

        db.once("open", () => {
            console.log(
                `Tenant connection for ${dbName} MongoDB Connection ok!`
            );
        });

        await db.model("users", UsersSchema);

        return db;
    } catch (error) {
        return error;
    }
};

export { initAdminDbConnection, initTenantDBConnection };