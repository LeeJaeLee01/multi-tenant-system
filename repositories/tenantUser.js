
const mainSchemaName = "tenantusers";

// This function is part of a service 
// with transactions.
const addATenantUserRepo = async (
    dbConn,
    userData,
    session = null
) => {
    const sessionOption = {};
    if (session) {
        sessionOption.session = session;
    }
    const data = await dbConn
        .model(mainSchemaName)
        .create([userData], sessionOption);
    return data[0];
};

const getATenantUserRepo = async (
    dbConn,
    findQuery,
    selectQuery = {}
) => {
    const data = await dbConn
        .model(mainSchemaName)
        .findOne(findQuery)
        .select(selectQuery)
        .lean();

    return data;
};

const updateATenantUserRepo = async (
    dbConn,
    findQuery,
    updateQuery
) => {
    const data = await dbConn
        .model(mainSchemaName)
        .updateOne(findQuery, updateQuery);
    return data;
};

export { addATenantUserRepo, getATenantUserRepo, updateATenantUserRepo };