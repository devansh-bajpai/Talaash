// backend/src/users.ts
import bcrypt from "bcryptjs";

export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
};

const users: User[] = []; // in-memory; will reset when server restarts

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const existing = users.find((u) => u.email === email);
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user: User = {
    id: users.length + 1,
    name,
    email,
    passwordHash,
  };

  users.push(user);
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function findUserById(id: number): User | undefined {
  return users.find((u) => u.id === id);
}
