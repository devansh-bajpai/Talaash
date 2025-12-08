// frontend/lib/user.ts
// Simple in-memory "database" of users.
// NOTE: This resets whenever the dev server restarts.

import bcrypt from "bcryptjs";

export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
};

const users: User[] = []; // pretend DB in memory

export async function createUser(
  name: string,
  email: string,
  password: string
) {
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

export function findUserByEmail(email: string) {
  return users.find((u) => u.email === email) || null;
}

export function findUserById(id: number) {
  return users.find((u) => u.id === id) || null;
}
