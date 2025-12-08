// backend/src/userService.ts
import bcrypt from "bcryptjs";
import { User, IUser } from "./models/User";

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<IUser> {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, passwordHash });
  await user.save();
  return user;
}

export async function findUserByEmail(
  email: string
): Promise<IUser | null> {
  return User.findOne({ email });
}

export async function findUserById(
  id: string
): Promise<IUser | null> {
  return User.findById(id);
}
