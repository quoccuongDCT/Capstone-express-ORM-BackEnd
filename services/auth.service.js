const pool = require("../configs/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../configs/jwt");

exports.register = async ({ name, email, password }) => {
  if (!email || !password || !name) {
    throw new Error("Missing fields");
  }

  const [exists] = await pool.query(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (exists.length) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword]
  );

  return {
    id: result.insertId,
    name,
    email,
  };
};

exports.login = async ({ email, password }) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (!rows.length) {
    throw new Error("Invalid email or password");
  }

  const user = rows[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  return {
    accessToken: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};

exports.getMe = async (userId) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?",
    [userId]
  );

  if (!rows.length) {
    throw new Error("User not found");
  }

  return rows[0];
};
