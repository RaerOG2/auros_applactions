"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail, signUpWithEmail } from "../services/auth-service";
import { ensureProfileExists } from "../services/profile-service";

type AuthMode = "login" | "register";

export function useAuthForm(mode: AuthMode) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error("Email and password are required.");
      }

      if (mode === "register") {
        if (!username.trim()) {
          throw new Error("Username is required.");
        }

        const data = await signUpWithEmail({
          email,
          password,
        });

        if (!data.user) {
          setSuccessMessage("Account created. Please check your email if confirmation is enabled.");
          return;
        }

        await ensureProfileExists({
          userId: data.user.id,
          fallbackEmail: data.user.email,
        });

        if (displayName.trim() || username.trim()) {
          const { updateProfile } = await import("../services/profile-service");
          await updateProfile(data.user.id, {
            username,
            display_name: displayName.trim() || username.trim(),
          });
        }

        setSuccessMessage("Account created successfully.");
        router.push("/profile");
        return;
      }

      const data = await signInWithEmail({
        email,
        password,
      });

      if (data.user) {
        await ensureProfileExists({
          userId: data.user.id,
          fallbackEmail: data.user.email,
        });
      }

      router.push("/chat");
    } catch (error: any) {
      setErrorMessage(error?.message || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    displayName,
    setDisplayName,
    submitting,
    errorMessage,
    successMessage,
    handleSubmit,
  };
}