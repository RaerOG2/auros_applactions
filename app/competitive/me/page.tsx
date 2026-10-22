"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import CompetitiveStaffEntry from "../../../components/competitive/CompetitiveStaffEntry";
import EpicLinkPanel from "../../../components/competitive/EpicLinkPanel";
import CompetitiveCareerProgress from "../../../components/competitive/CompetitiveCareerProgress";
import { supabase } from "../../../lib/supabase";

import {
  createMyCompetitiveIdentity,
  getMyCompetitiveIdentity,
  updateMyCompetitiveIdentity,
  type MyCompetitiveIdentity,
} from "../../../services/competitive-players.service";

type IdentityState =
  | "loading"
  | "logged_out"
  | "not_created"
  | "ready"
  | "error";

export default function MyCompetitiveProfilePage() {
  const [state, setState] = useState<IdentityState>("loading");
  const [profile, setProfile] = useState<MyCompetitiveIdentity | null>(null);

  const [countryCode, setCountryCode] = useState("");
  const [bio, setBio] = useState("");
  const [favoritePoi, setFavoritePoi] = useState("");

  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function populate(profileData: MyCompetitiveIdentity) {
    setProfile(profileData);
    setCountryCode(profileData.countryCode ?? "");
    setBio(profileData.bio);
    setFavoritePoi(profileData.favoritePoi);
    setState("ready");
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setState("loading");
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!active) {
          return;
        }

        if (!user) {
          setState("logged_out");
          return;
        }

        const identity = await getMyCompetitiveIdentity();

        if (!active) {
          return;
        }

        if (identity) {
          populate(identity);
        } else {
          setState("not_created");
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your Competitive identity.",
          );
          setState("error");
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  async function createProfile() {
    if (working) {
      return;
    }

    setWorking(true);
    setError("");
    setNotice("");

    try {
      const identity = await createMyCompetitiveIdentity();
      populate(identity);
      setNotice("Your permanent Competitive identity is ready.");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create your Competitive profile.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function saveProfile() {
    if (working) {
      return;
    }

    setWorking(true);
    setError("");
    setNotice("");

    try {
      await updateMyCompetitiveIdentity({
        countryCode: countryCode.trim().toUpperCase() || null,
        bio: bio.trim(),
        favoritePoi: favoritePoi.trim(),
      });

      const updated = await getMyCompetitiveIdentity();

      if (updated) {
        populate(updated);
      }

      setNotice("Player card updated successfully.");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save your Competitive profile.",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="competitivePage">
      <div className="competitiveOpsHeader compPlayersHeader">
        <div>
          <Link href="/competitive/players" className="compBack">
            ← PLAYER DIRECTORY
          </Link>

          <span className="competitiveEyebrow gold">
            AUROS COMPETITIVE // ACCOUNT
          </span>

          <h1>MY PLAYER CARD.</h1>

          <p className="compHeaderDescription">
            Set up your permanent Competitive identity, customize your profile
            and share your player card with the community.
          </p>
        </div>

        <CompetitiveStaffEntry compact />
      </div>

      {error && <div className="compError compPlayerFormMessage">{error}</div>}
      {notice && <div className="compSuccess compPlayerFormMessage">{notice}</div>}

      {state === "loading" && (
        <div className="competitivePanel compPlayerDirectoryEmpty">
          Loading your Auros account…
        </div>
      )}

      {state === "error" && (
        <div className="competitivePanel compPlayerDirectoryEmpty">
          <strong>Player Profile Unavailable</strong>
          <p>Check your connection and the Player Profiles SQL migration.</p>
          <button
            type="button"
            className="compSecondaryButton"
            onClick={() => window.location.reload()}
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {state === "logged_out" && (
        <div className="competitivePanel compPlayerDirectoryEmpty">
          <strong>Auros Account Required</strong>
          <p>Sign in to create or edit your Competitive identity.</p>
          <Link href="/login" className="compPrimaryButton">
            SIGN IN →
          </Link>
        </div>
      )}

      {state === "not_created" && (
        <div className="competitivePanel compPlayerCreatePanel">
          <span className="competitiveEyebrow gold">YOUR JOURNEY STARTS HERE</span>
          <h2>One player. One permanent Competitive ID.</h2>
          <p>
            Your existing Auros account is used to create your Competitive
            profile. You do not need a second account. Your name will show as
            your Competitive ID until Epic linking is available.
          </p>
          <button
            type="button"
            className="compPrimaryButton"
            disabled={working}
            onClick={createProfile}
          >
            {working ? "CREATING PROFILE…" : "CREATE MY PLAYER CARD →"}
          </button>
        </div>
      )}

      {state === "ready" && profile && (
        <div className="compMyProfileLayout">
          <div className="competitivePanel compPlayerSection">
            <div className="competitivePanelHeader">
              <h2>Player Identity</h2>
              <span>PERMANENT</span>
            </div>

            <div className="compMyProfileIdentity">
              <span className="compPlayerAvatar" aria-hidden="true">
                {profile.displayName.slice(0, 1).toUpperCase()}
              </span>

              <div>
                <span className="competitiveEyebrow">YOUR DISPLAY NAME</span>
                <strong>{profile.displayName}</strong>
                <small>{profile.competitiveId}</small>
              </div>
            </div>

            <div className="compPlayerCardBadges">
              <span className="compPlayerBadge">SOLO</span>
              {profile.epicVerified && (
                <span className="compPlayerBadge compPlayerBadge--gold">
                  EPIC VERIFIED
                </span>
              )}
            </div>

            <p className="compPlayerAsideNote">
              Link your real Epic Games account below. Your Competitive ID stays
              permanently attached to your Auros account. AP and verification
              cannot be manually edited.
            </p>

            <Link
              href={`/competitive/players/${encodeURIComponent(profile.competitiveId)}`}
              className="compSecondaryButton"
            >
              VIEW PUBLIC PLAYER CARD →
            </Link>
          </div>

          <form
            className="competitivePanel compPlayerSection compPlayerEditForm"
            onSubmit={(event) => {
              event.preventDefault();
              saveProfile();
            }}
          >
            <div className="competitivePanelHeader">
              <h2>Customize Profile</h2>
              <span>ACCOUNT SETTINGS</span>
            </div>

            <label className="compField">
              <span>Country (ISO 2-letter code)</span>
              <input
                value={countryCode}
                maxLength={2}
                placeholder="DE"
                onChange={(event) =>
                  setCountryCode(event.target.value.toUpperCase())
                }
              />
            </label>

            <label className="compField">
              <span>Favorite Auros POI</span>
              <input
                value={favoritePoi}
                maxLength={80}
                placeholder="Your favorite drop spot"
                onChange={(event) => setFavoritePoi(event.target.value)}
              />
            </label>

            <label className="compField">
              <span>Player Bio ({bio.length}/280)</span>
              <textarea
                value={bio}
                maxLength={280}
                rows={5}
                placeholder="Tell the Competitive community about yourself…"
                onChange={(event) => setBio(event.target.value)}
              />
            </label>

            <p className="compPlayerAsideNote">
              Country, bio and favorite POI will be visible publicly on your
              Competitive Player Card. Please do not enter private information.
            </p>

            <button
              type="submit"
              className="compPrimaryButton"
              disabled={working}
            >
              {working ? "SAVING…" : "SAVE PLAYER PROFILE"}
            </button>
          </form>

          <div className="compMyProfileExtras">
            <EpicLinkPanel
              verified={profile.epicVerified}
              displayName={profile.displayName}
            />
            <CompetitiveCareerProgress competitiveId={profile.competitiveId} />
          </div>
        </div>
      )}
    </section>
  );
}
