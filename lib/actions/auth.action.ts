"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 7 * 24 * 60 * 60; // 7 days in seconds

export async function signUp(params: SignUpParams) {
  const { email, name, uid } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in instead",
      };
    }

    await db.collection("users").doc(uid).set({ name, email });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log("Error creating a user", error);

    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "this email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create an account",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User not found. Please sign up.",
      };
    }

    await setSessionCookie(idToken);
  } catch (error) {
    console.log("Error signing in", error);

    return {
      success: false,
      message: "Failed to log into account.",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000, // Convert seconds to milliseconds
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log("Error getting current user", error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user;
}
