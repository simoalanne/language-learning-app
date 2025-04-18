import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


export const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user) => {
  return generateJWT({ username: user.username, id: user.id });
};

export const generateJWT = (payload) => { return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }); };
