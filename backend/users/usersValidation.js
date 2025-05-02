import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(100, { message: 'Password must be at most 100 characters long' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' });

const usernameSchema = z
  .string()
  .min(2, { message: 'Username must be at least 2 characters long' })
  .max(20, { message: 'Username must be at most 20 characters long' })
  .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' });


export const validateUser = (req, res, next) => {
  const { username, password } = req.body;
  const usernameResult = usernameSchema.safeParse(username);
  const passwordResult = passwordSchema.safeParse(password);

  if (!usernameResult.success || !passwordResult.success) {
    const errors = [
      ...(usernameResult.error?.errors || []),
      ...(passwordResult.error?.errors || [])
    ].map(err => err.message);
    return res.status(400).json({ errors });
  }

  next();
};

export const validateChangePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (oldPassword === newPassword) {
    return res.status(400).json({ error: 'New password must be different from old password' });
  }

  const oldPasswordResult = passwordSchema.safeParse(oldPassword);
  const newPasswordResult = passwordSchema.safeParse(newPassword);

  if (!oldPasswordResult.success || !newPasswordResult.success) {
    const errors = [
      ...(oldPasswordResult.error?.errors || []),
      ...(newPasswordResult.error?.errors || [])
    ].map(err => err.message);
    return res.status(400).json({ errors });
  }

  next();
};

export const validateChangeUsername = (req, res, next) => {
  const { newUsername } = req.body;
  const usernameResult = usernameSchema.safeParse(newUsername);

  if (!usernameResult.success) {
    const errors = usernameResult.error.errors.map(err => err.message);
    return res.status(400).json({ errors });
  }

  next();
};

export const validateDeleteAccount = (req, res, next) => {
  const { password } = req.body;
  const passwordResult = passwordSchema.safeParse(password);

  if (!passwordResult.success) {
    const errors = passwordResult.error.errors.map(err => err.message);
    return res.status(400).json({ errors });
  }

  next();
}
