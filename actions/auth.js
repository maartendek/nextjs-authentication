"use server";

import { createAuthSession, destroySession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { redirect } from "next/navigation";

export async function signup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("email");

  // validation
  let errors = {};

  if (!email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }
  if (password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters long.";
  }

  if (Object.keys(errors).length > 0) return { errors };

  // store in database
  try {
    const userId = createUser(email, hashUserPassword(password));
    await createAuthSession(userId);
  } catch (error) {
    if (error.code === "SQL ITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email:
            "It seems like an account for the given email address already exists.",
        },
      };
    }
    throw error;
  }

  redirect("/training");
}

export async function login(prevSate, formData) {
  const email = formData.get("email");
  const password = formData.get("email");

  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    return {
      errors: {
        email: "Could not authenticate user",
      },
    };
  }

  const isValidPassword = verifyPassword(existingUser.password, password);

  if (!existingUser) {
    return {
      errors: {
        password: "Could not authenticate user",
      },
    };
  }

  await createAuthSession(existingUser.id);
  redirect("/training");
}

export async function auth(mode, prevState, formData) {
  if (mode === "login") {
    return login(prevState, formData);
  } else {
    return signup(prevState, formData);
  }
}

export async function logout() {
    await destroySession();
    redirect('/');
}