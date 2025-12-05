import bcrypt from "bcryptjs";
import { UserModel, IUser } from "./models/User";

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<IUser> {
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);

  return UserModel.create({
    name,
    email,
    passwordHash,
  });
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return UserModel.findOne({ email });
}

export async function findUserById(id: string): Promise<IUser | null> {
  return UserModel.findById(id);
}
