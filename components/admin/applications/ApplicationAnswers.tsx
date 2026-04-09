"use client";

type ApplicationAnswersProps = {
  developer_skills?: string | null;
  developer_projects?: string | null;
  support_cases?: string | null;
  support_communication?: string | null;
  competitive_knowledge?: string | null;
  competitive_plans?: string | null;
  manager_leadership?: string | null;
  manager_organization?: string | null;
  director_vision?: string | null;
  director_responsibility?: string | null;
  other_strengths?: string | null;
};

export default function ApplicationAnswers({
  developer_skills,
  developer_projects,
  support_cases,
  support_communication,
  competitive_knowledge,
  competitive_plans,
  manager_leadership,
  manager_organization,
  director_vision,
  director_responsibility,
  other_strengths,
}: ApplicationAnswersProps) {
  const items: Array<[string, string | null | undefined]> = [
    ["Developer Skills", developer_skills],
    ["Developer Projects", developer_projects],
    ["Support Cases", support_cases],
    ["Support Communication", support_communication],
    ["Competitive Knowledge", competitive_knowledge],
    ["Competitive Plans", competitive_plans],
    ["Manager Leadership", manager_leadership],
    ["Manager Organization", manager_organization],
    ["Director Vision", director_vision],
    ["Director Responsibility", director_responsibility],
    ["Other Strengths", other_strengths],
  ];

  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "14px",
        background: "#081225",
        border: "1px solid #22304d",
        marginBottom: 14,
      }}
    >
      <strong>Category Answers</strong>

      <div style={{ display: "grid", gap: "10px", marginTop: 12 }}>
        {items.map(([title, value]) => (
          <div key={title}>
            <p style={{ margin: "0 0 6px 0", color: "#9fb0d0" }}>
              <strong style={{ color: "#dbe7ff" }}>{title}</strong>
            </p>
            <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.7 }}>
              {value || "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}