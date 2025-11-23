import {
    addATenantRepo,
} from "../repositories/tenant.js";
import { addATenantUserRepo } from "../repositories/tenantUser.js";
import { setCacheConnection } from "../utils/lruCacheManager.js";
import { addAUserRepo } from "../repositories/users.js";
import { initTenantDBConnection } from "../utils/initDBConnection.js";

const addATenantService = async (
    dbConn,
    tenantData
) => {
    const session = await dbConn.startSession();
    session.startTransaction();
    try {
        const data = await addATenantRepo(
            dbConn,
            { ...tenantData },
            session
        );

        let userData;
        if (data._id) {
            userData = await addATenantUserRepo(
                dbConn,
                {
                    tenantId: data._id,
                    email: tenantData.email,
                },
                session
            );

            const tenantDbConnection = await initTenantDBConnection(
                data.dbUri,
                data.name
            );

            await addAUserRepo(
                tenantDbConnection,
                {
                    _id: userData._id,
                    email: tenantData.email,
                },
                session
            );

            await session.commitTransaction();
            session.endSession();

            setCacheConnection(data._id.toString(), tenantDbConnection);
        }

        return {
            success: true,
            statusCode: 201,
            message: `Tenant added successfully`,
            responseObject: { tenantId: data._id, userId: userData?._id },
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export { addATenantService };