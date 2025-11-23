import { loginService } from "../services/auth.js";
import { addATenantService } from "../services/tenant.js";
import { getAdminConnection } from "../utils/connectionManager.js";

export async function loginController(req, res) {
    try {
        const serviceFnResponse = await loginService(req.body);
        res.status(serviceFnResponse.statusCode).json({ ...serviceFnResponse });
    } catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Internal server error",
            error: error.message
        });
    }
}

export async function addATenantController(req, res) {
    try {
        const adminDbConnection = getAdminConnection();
        const serviceFnResponse = await addATenantService(adminDbConnection, req.body);

        res.status(serviceFnResponse.statusCode).json({ ...serviceFnResponse });
    } catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Internal server error",
            error: error.message
        });
    }
}