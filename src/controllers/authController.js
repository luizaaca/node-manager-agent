import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_EXPIRATION } from '../config/constants.js';

// Simulated users (later use database)
const users = [
  { id: 1, email: 'user@example.com', password: bcrypt.hashSync('password123', 10) }
];

const login = (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Verify password
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );

  res.json({ token, message: 'Login successful' });
};

const register = (req, res) => {
  const { email, password } = req.body;

  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  users.push(newUser);

  res.status(201).json({ message: 'User created successfully' });
};

export { login, register }; 