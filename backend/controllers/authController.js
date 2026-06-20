const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { findUserByEmail, createUser, findUserById } = require("../models/userModel");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/jwt");

/**
 * POST /auth/register
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const errors = {};

    if (!name || name.trim().length < 2)
      errors.name = "Name must be at least 2 characters";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Valid email is required";
    if (!password || password.length < 6)
      errors.password = "Password must be at least 6 characters";

    if (Object.keys(errors).length > 0)
      return res.status(400).json({ success: false, errors });

    const existing = await findUserByEmail(email);
    if (existing)
      return res.status(409).json({ success: false, errors: { email: "Email already registered" } });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await createUser(name.trim(), email, hashed);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({ success: true, message: "Account created successfully", token, user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
}

/**
 * POST /auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await findUserByEmail(email);
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _p, ...safeUser } = user;
    res.json({ success: true, message: "Login successful", token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
}

/**
 * GET /auth/me
 */
async function getMe(req, res) {
  try {
    const user = await findUserById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to get user" });
  }
}

module.exports = { register, login, getMe };
