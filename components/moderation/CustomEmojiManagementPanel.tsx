"use client";

import { useEffect, useState } from "react";
import type { CustomEmojiItem } from "../../types/emoji";
import { createCustomEmoji, deactivateCustomEmoji, getCustomEmojis } from "../../services/emoji-service";

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const panelStyle: React.CSSProperties = {
  background: "rgba(11, 21, 43, 0.88)",
  border: "1px solid #22304d",
  borderRadius: "20px",
  padding: "18px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  borderRadius: "12px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.92)",
  color: "white",
  outline: "none",
  fontSize: "14px",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #5b2333",
  background: "#1d1220",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

export default function CustomEmojiManagementPanel() {
  const [emojis, setEmojis] = useState<CustomEmojiItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [shortcode, setShortcode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadEmojis() {
    try {
      setLoading(true);
      const data = await getCustomEmojis();
      setEmojis(data);
    } catch (error) {
      console.error("[CustomEmoji] load failed:", error);
      setEmojis([]);
    } finally {
      setLoading(false);
    }
  }

  async function saveEmoji() {
    if (!shortcode.trim() || !imageUrl.trim()) {
      alert("Shortcode and image URL are required.");
      return;
    }

    try {
      setSubmitting(true);
      await createCustomEmoji({
        shortcode: shortcode.trim(),
        imageUrl: imageUrl.trim(),
      });

      setShortcode("");
      setImageUrl("");
      await loadEmojis();
    } catch (error) {
      console.error("[CustomEmoji] save failed:", error);
      alert("Could not create emoji.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeEmoji(id: string) {
    try {
      await deactivateCustomEmoji(id);
      await loadEmojis();
    } catch (error) {
      console.error("[CustomEmoji] remove failed:", error);
      alert("Could not deactivate emoji.");
    }
  }

  useEffect(() => {
    loadEmojis();
  }, []);

  return (
    <>
      <style jsx>{`
        .emojiGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        @media (max-width: 980px) {
          .emojiGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ display: "grid", gap: 18 }}>
        <section style={glassCardStyle}>
          <p
            style={{
              color: "#4cc9f0",
              fontWeight: 800,
              marginBottom: 10,
              fontSize: "13px",
              letterSpacing: "0.08em",
            }}
          >
            CUSTOM EMOJI MANAGEMENT
          </p>

          <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: "40px" }}>
            Custom Emojis
          </h1>

          <p style={{ color: "#9fb0d0", lineHeight: 1.7 }}>
            Create and manage custom chat emojis.
          </p>
        </section>

        <div className="emojiGrid">
          <section style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Create Emoji</h3>

            <div style={{ display: "grid", gap: 14 }}>
              <input
                value={shortcode}
                onChange={(e) => setShortcode(e.target.value)}
                style={inputStyle}
                placeholder="shortcode"
              />

              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={inputStyle}
                placeholder="https://..."
              />

              <button
                onClick={saveEmoji}
                disabled={submitting}
                style={primaryButtonStyle}
              >
                {submitting ? "Saving..." : "Create Emoji"}
              </button>
            </div>
          </section>

          <section style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Existing Emojis</h3>

            {loading ? (
              <div style={{ color: "#9fb0d0" }}>Loading emojis...</div>
            ) : emojis.length === 0 ? (
              <div style={{ color: "#9fb0d0" }}>No custom emojis found.</div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {emojis.map((emoji) => (
                  <div
                    key={emoji.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      padding: "12px",
                      borderRadius: "14px",
                      border: "1px solid #22304d",
                      background: "#081225",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <img
                        src={emoji.image_url}
                        alt={emoji.shortcode}
                        style={{
                          width: 28,
                          height: 28,
                          objectFit: "contain",
                          borderRadius: 6,
                        }}
                      />
                      <div style={{ color: "#dbe7ff" }}>:{emoji.shortcode}:</div>
                    </div>

                    <button
                      onClick={() => removeEmoji(emoji.id)}
                      style={dangerButtonStyle}
                    >
                      Deactivate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}