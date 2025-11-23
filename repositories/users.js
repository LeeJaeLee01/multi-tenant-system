const mainSchemaName = "users"

// This function is part of the service 
// with transactions.
const addAUserRepo = async (
    dbConn,
    userData,
    session = null
) => {
    const sessionOption = {};
    if (session) sessionOption.session = session;
    const data = await dbConn
        .model(mainSchemaName)
        .create([userData], sessionOption);
    return data[0];
};

const getAUserRepo = async (
    dbConn,
    findQuery = {},
    selectQuery = {}
) => {
    const data = await dbConn
        .model(mainSchemaName)
        .findOne(findQuery)
        .select(selectQuery)
        .lean();
    return data;
};

const updateUserRepo = async (
    dbConn,
    findQuery,
    updateQuery
) => {
    const data = await dbConn
        .model(mainSchemaName)
        .updateOne(findQuery, updateQuery);
    return data;
};

const getUsersRepo = async (
    dbConn,
    findQuery = {},
    selectQuery = {}
) => {
    const data = await dbConn
        .model(mainSchemaName)
        .find(findQuery)
        .select(selectQuery)
        .lean();

    return data;
};

export { addAUserRepo, getAUserRepo, updateUserRepo, getUsersRepo };