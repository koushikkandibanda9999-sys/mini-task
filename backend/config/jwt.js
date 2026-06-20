const JWT_SECRET = process.env.JWT_SECRET || "taskmanager_super_secret_2024";
const JWT_EXPIRES_IN = "24h";

module.exports = { JWT_SECRET, JWT_EXPIRES_IN };
