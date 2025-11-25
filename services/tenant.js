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
    let session = null;
    const supportsTransactions =
        dbConn?.client?.s?.options?.replicaSet ||
        dbConn?.client?.options?.replicaSet;

    if (supportsTransactions) {
        session = await dbConn.startSession();
        session.startTransaction();
    }

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
                }
            );

            if (session) {
                await session.commitTransaction();
            }

            setCacheConnection(data._id.toString(), tenantDbConnection);
        }

        return {
            success: true,
            statusCode: 201,
            message: `Tenant added successfully`,
            responseObject: { tenantId: data._id, userId: userData?._id },
        };
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

export { addATenantService };