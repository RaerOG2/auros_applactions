"use client";

const faqItems = [
  {
    question: "How do I apply for an Auros role?",
    answer:
      "Go to the Apply page, choose an open role, fill in the form, and submit your application.",
  },
  {
    question: "How can I check my application status?",
    answer:
      "Use the Status page and enter the email address you used in your application together with your tracking code.",
  },
  {
    question: "What is a tracking code?",
    answer:
      "Your tracking code is generated after you submit an application. Save it carefully because you need it for future status checks.",
  },
  {
    question: "How long does the review process take?",
    answer:
      "Review time can vary depending on the number of applications and the role you applied for. Please be patient while the Auros team reviews submissions.",
  },
  {
    question: "Can I apply for more than one role?",
    answer:
      "Yes, but make sure each application is serious and relevant to the role you want to join.",
  },
  {
    question: "Do I need previous experience?",
    answer:
      "Not always. Some roles benefit from experience, but motivation, reliability, and willingness to improve are also important.",
  },
];

export default function FAQPage() {
  const glassCardStyle: React.CSSProperties = {
    background: "rgba(15, 27, 52, 0.74)",
    border: "1px solid rgba(34, 48, 77, 0.95)",
    borderRadius: "24px",
    padding: "24px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
  };

  const itemStyle: React.CSSProperties = {
    background: "rgba(11, 21, 43, 0.88)",
    border: "1px solid #22304d",
    borderRadius: "18px",
    padding: "18px",
  };

  return (
    <>
      <section style={{ ...glassCardStyle, marginBottom: "22px" }}>
        <p
          style={{
            color: "#4cc9f0",
            fontWeight: 800,
            marginBottom: 10,
            fontSize: "13px",
            letterSpacing: "0.08em",
          }}
        >
          AUROS FAQ
        </p>

        <h1 style={{ margin: 0, fontSize: "46px", lineHeight: 1.05 }}>
          Frequently Asked Questions
        </h1>

        <p
          style={{
            color: "#9fb0d0",
            lineHeight: 1.75,
            fontSize: "17px",
            marginTop: 16,
            marginBottom: 0,
            maxWidth: "760px",
          }}
        >
          Find quick answers about applications, status checks, and how the
          Auros system works.
        </p>
      </section>

      <section style={glassCardStyle}>
        <div style={{ display: "grid", gap: "14px" }}>
          {faqItems.map((item) => (
            <div key={item.question} style={itemStyle}>
              <h3 style={{ margin: "0 0 10px 0" }}>{item.question}</h3>
              <p style={{ margin: 0, color: "#9fb0d0", lineHeight: 1.7 }}>
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}