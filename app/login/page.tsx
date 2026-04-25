import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="aurosAccessPage">
          <div className="aurosAccessCard">
            <p className="aurosWelcomeOverline">AUROS ACCOUNT</p>
            <h1 className="aurosWelcomeTitle">Loading...</h1>
          </div>
        </section>
      }
    >
      <LoginClient />
    </Suspense>
  );
}