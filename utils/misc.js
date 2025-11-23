import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "random secret";
const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

const signJWT = (data) => {
    return jwt.sign(data, JWT_SECRET);
};

const verifyJWT = (payload) => {
    return jwt.verify(payload, JWT_SECRET);
};

const generateHash = async (input) => {
    try {
        const hash = await bcrypt.hash(input, saltRounds);
        return hash;
    } catch (error) {
        console.error("Error generating hash:", error);
        throw error;
    }
};

const comparePassword = async (plainPassword, hash) => {
    try {
        const match = await bcrypt.compare(plainPassword, hash);
        return match;
    } catch (error) {
        console.error("Error comparing password:", error);
        throw error;
    }
};

export {
    signJWT,
    verifyJWT,
    generateHash,
    comparePassword,
};