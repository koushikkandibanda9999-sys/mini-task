const pool = require("../config/database");

/**
 * Find a user by email.
 */
async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email.toLowerCase()]
  );
  return rows[0] || null;
}

/**
 * Find a user by ID.
 */
async function findUserById(id) {
  const [rows] = await pool.execute(
    "SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

/**
 * Create a new user.
 */
async function createUser(name, email, hashedPassword) {
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email.toLowerCase(), hashedPassword]
  );
  return findUserById(result.insertId);
}

module.exports = { findUserByEmail, findUserById, createUser };
