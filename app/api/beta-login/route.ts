import {
  NextRequest,
  NextResponse,
} from "next/server";

type BetaUser = {
  username: string;
  password: string;
};

function getBetaUsers(): BetaUser[] {
  const raw =
    process.env.BETA_USERS ?? "";

  return raw
    .split(",")
    .map((entry) =>
      entry.trim()
    )
    .filter(Boolean)
    .map((entry) => {
      const separatorIndex =
        entry.indexOf(":");

      if (separatorIndex === -1) {
        return null;
      }

      const username =
        entry
          .slice(
            0,
            separatorIndex
          )
          .trim();

      const password =
        entry
          .slice(
            separatorIndex + 1
          )
          .trim();

      if (
        !username ||
        !password
      ) {
        return null;
      }

      return {
        username,
        password,
      };
    })
    .filter(
      (
        user
      ): user is BetaUser =>
        user !== null
    );
}

export async function POST(
  request: NextRequest
) {
  const formData =
    await request.formData();

  const username =
    String(
      formData.get(
        "username"
      ) ?? ""
    ).trim();

  const password =
    String(
      formData.get(
        "password"
      ) ?? ""
    );

  const betaUsers =
    getBetaUsers();

  const betaSecret =
    process.env
      .BETA_COOKIE_SECRET;

  if (
    betaUsers.length === 0 ||
    !betaSecret
  ) {
    console.error(
      "Beta configuration is missing."
    );

    return NextResponse.redirect(
      new URL(
        "/beta-login?error=config",
        request.url
      ),
      303
    );
  }

  const validUser =
    betaUsers.find(
      (user) =>
        user.username ===
          username &&
        user.password ===
          password
    );

  if (!validUser) {
    return NextResponse.redirect(
      new URL(
        "/beta-login?error=1",
        request.url
      ),
      303
    );
  }

  const response =
    NextResponse.redirect(
      new URL(
        "/",
        request.url
      ),
      303
    );

  response.cookies.set(
    "beta-auth",
    betaSecret,
    {
      httpOnly: true,

      secure:
        process.env
          .NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge:
        60 *
        60 *
        24 *
        30,
    }
  );

  return response;
}