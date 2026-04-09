"use client";

import Link from "next/link";
import AuthCard from "../../components/accounts/AuthCard";
import { useAuthForm } from "../../hooks/useAuthForm";

export default function LoginPage() {
  const auth = useAuthForm("login");

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <AuthCard
        mode="login"
        email={auth.email}
        setEmail={auth.setEmail}
        password={auth.password}
        setPassword={auth.setPassword}
        submitting={auth.submitting}
        errorMessage={auth.errorMessage}
        successMessage={auth.successMessage}
        onSubmit={auth.handleSubmit}
      />

      <div
        style={{
          marginTop: 14,
          padding: "16px",
          borderRadius: "16px",
          border: "1px solid #22304d",
          background: "rgba(11, 21, 43, 0.88)",
          color: "#9fb0d0",
          lineHeight: 1.7,
        }}
      >
        No account yet?{" "}
        <Link href="/register" style={{ color: "#95ecff", fontWeight: 700 }}>
          Create one here
        </Link>
        .
      </div>
    </div>
  );
}