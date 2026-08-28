"use client";

export default function ChatWelcomeView() {
  return (
    <div className="aurosWelcomeView">
      <div className="aurosWelcomeCard">
        <p className="aurosWelcomeOverline">AUROSCHANNEL</p>
        <h2 className="aurosWelcomeTitle">Welcome to the live communication system</h2>
        <p className="aurosWelcomeText">
          This interface is built to combine server chat, direct messages, staff moderation, and future community tools
          inside one unified page.
        </p>

        <div className="aurosWelcomeGrid">
          <div className="aurosWelcomeMiniCard">
            <h3>Server Chat</h3>
            <p>Create custom community servers and channels like Discord.</p>
          </div>

          <div className="aurosWelcomeMiniCard">
            <h3>Direct Messages</h3>
            <p>Message friends and team members privately inside the same interface.</p>
          </div>
        </div>
      </div>
    </div>
  );
}