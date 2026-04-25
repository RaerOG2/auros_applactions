import "../../styles/auros-channel.css";

export default function BetaLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return (
    <main className="aurosAccessPage">
      <section className="aurosAccessCard">
        <p className="aurosWelcomeOverline">Beta Access</p>

        <h1 className="aurosWelcomeTitle">Auros Beta Zugang</h1>

        <p className="aurosWelcomeText">
          Bitte melde dich an, um die Beta-Version zu betreten.
        </p>

        {searchParams?.error && (
          <div className="aurosAccessError">
            Benutzername oder Passwort ist falsch.
          </div>
        )}

        <form action="/api/beta-login" method="POST" className="aurosAccessForm">
          <div className="aurosAccessGrid">
            <input
              className="aurosAccessInput"
              name="username"
              placeholder="Benutzername"
              autoComplete="username"
              required
            />

            <input
              className="aurosAccessInput"
              name="password"
              type="password"
              placeholder="Passwort"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="aurosAccessPrimary" type="submit">
            Anmelden
          </button>
        </form>
      </section>
    </main>
  );
}