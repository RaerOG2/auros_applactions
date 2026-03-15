"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import AurosBackground from "../../components/AurosBackground";
import AurosTopbar from "../../components/AurosTopbar";

type Job = {
  id: string;
  title: string | null;
  department: string | null;
  type: string | null;
  location: string | null;
  description: string | null;
  requirements: string[] | null;
  status: string | null;
  role_category: string | null;
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "transparent",
  color: "white",
  padding: "32px 20px 60px",
  position: "relative",
  zIndex: 1,
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1180px",
  margin: "0 auto",
};

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "14px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.92)",
  color: "white",
  outline: "none",
  fontSize: "15px",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "120px",
  resize: "vertical",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#dbe7ff",
  marginBottom: "8px",
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px 18px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(76, 201, 240, 0.18)",
};

const ghostButtonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.9)",
  color: "white",
  textDecoration: "none",
  fontWeight: 600,
  textAlign: "center",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(76, 201, 240, 0.18)",
  background: "rgba(76, 201, 240, 0.10)",
  color: "#95ecff",
  fontSize: "13px",
  fontWeight: 700,
};

function createTrackingCode() {
  return `AU-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
    .toString()
    .slice(-6)}`;
}

export default function ApplyPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState("");

  const [name, setName] = useState("");
  const [discord, setDiscord] = useState("");
  const [discordName, setDiscordName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("");
  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");
  const [availability, setAvailability] = useState("");

  const [developerSkills, setDeveloperSkills] = useState("");
  const [developerProjects, setDeveloperProjects] = useState("");
  const [supportCases, setSupportCases] = useState("");
  const [supportCommunication, setSupportCommunication] = useState("");
  const [competitiveKnowledge, setCompetitiveKnowledge] = useState("");
  const [competitivePlans, setCompetitivePlans] = useState("");
  const [managerLeadership, setManagerLeadership] = useState("");
  const [managerOrganization, setManagerOrganization] = useState("");
  const [directorVision, setDirectorVision] = useState("");
  const [directorResponsibility, setDirectorResponsibility] = useState("");
  const [otherStrengths, setOtherStrengths] = useState("");

  const [loading, setLoading] = useState(false);
  const [submittedCode, setSubmittedCode] = useState("");
  const [submittedRole, setSubmittedRole] = useState("");

  async function loadJobs() {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, title, department, type, location, description, requirements, status, role_category"
      )
      .eq("status", "Open")
      .order("title", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    const nextJobs = (data as Job[]) || [];
    setJobs(nextJobs);

    if (nextJobs.length > 0) {
      setJobId((prev) => prev || nextJobs[0].id);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job.id === jobId) || null;
  }, [jobs, jobId]);

  const selectedCategory = selectedJob?.role_category || "Other";

  const isDeveloper = selectedCategory === "Developer";
  const isSupporter = selectedCategory === "Supporter";
  const isCompetitiveManager = selectedCategory === "Competitive Manager";
  const isManager = selectedCategory === "Manager";
  const isDirector = selectedCategory === "Director";
  const isOther = selectedCategory === "Other";

  function validateRoleQuestions() {
    if (isDeveloper && (!developerSkills || !developerProjects)) {
      alert("Please fill in the developer-specific questions.");
      return false;
    }

    if (isSupporter && (!supportCases || !supportCommunication)) {
      alert("Please fill in the supporter-specific questions.");
      return false;
    }

    if (isCompetitiveManager && (!competitiveKnowledge || !competitivePlans)) {
      alert("Please fill in the competitive manager-specific questions.");
      return false;
    }

    if (isManager && (!managerLeadership || !managerOrganization)) {
      alert("Please fill in the manager-specific questions.");
      return false;
    }

    if (isDirector && (!directorVision || !directorResponsibility)) {
      alert("Please fill in the director-specific questions.");
      return false;
    }

    if (isOther && !otherStrengths) {
      alert("Please fill in the role-specific question.");
      return false;
    }

    return true;
  }

  async function submitApplication() {
    if (!jobId || !name || !discord || !motivation || !email) {
      alert("Please fill in role, name, discord, email, and motivation.");
      return;
    }

    if (!validateRoleQuestions()) return;

    setLoading(true);

    const trackingCode = createTrackingCode();

    const { error } = await supabase.from("applications").insert({
      job_id: jobId,
      name,
      discord,
      discord_name: discordName,
      age,
      email,
      timezone,
      experience,
      motivation,
      availability,
      developer_skills: developerSkills,
      developer_projects: developerProjects,
      support_cases: supportCases,
      support_communication: supportCommunication,
      competitive_knowledge: competitiveKnowledge,
      competitive_plans: competitivePlans,
      manager_leadership: managerLeadership,
      manager_organization: managerOrganization,
      director_vision: directorVision,
      director_responsibility: directorResponsibility,
      other_strengths: otherStrengths,
      tracking_code: trackingCode,
      status: "New",
    });

    if (error) {
      setLoading(false);
      alert("Error submitting application");
      console.log(error);
      return;
    }

    try {
      const notifyResponse = await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: selectedJob?.title || "-",
          category: selectedCategory,
          name,
          discord,
          discordName,
          age,
          email,
          timezone,
          experience,
          motivation,
          availability,
          trackingCode,
        }),
      });

      const notifyJson = await notifyResponse.json().catch(() => null);
      console.log("Notify response:", notifyJson);
    } catch (error) {
      console.log("Notify request failed:", error);
    }

    setLoading(false);
    setSubmittedCode(trackingCode);
    setSubmittedRole(selectedJob?.title || "Role");

    setName("");
    setDiscord("");
    setDiscordName("");
    setAge("");
    setEmail("");
    setTimezone("");
    setExperience("");
    setMotivation("");
    setAvailability("");
    setDeveloperSkills("");
    setDeveloperProjects("");
    setSupportCases("");
    setSupportCommunication("");
    setCompetitiveKnowledge("");
    setCompetitivePlans("");
    setManagerLeadership("");
    setManagerOrganization("");
    setDirectorVision("");
    setDirectorResponsibility("");
    setOtherStrengths("");

    if (jobs.length > 0) {
      setJobId(jobs[0].id);
    }
  }

  if (submittedCode) {
    return (
      <>
        <AurosBackground />
        <main style={pageStyle}>
          <div style={{ ...containerStyle, maxWidth: "900px" }}>
            <AurosTopbar current="apply" />

            <div style={{ marginBottom: 20 }}>
              <a href="/" style={ghostButtonStyle}>
                ← Back to Home
              </a>
            </div>

            <section style={{ ...glassCardStyle, padding: "34px" }}>
              <h1 style={{ margin: 0, fontSize: "44px", marginBottom: 16 }}>
                Application submitted successfully
              </h1>

              <p style={{ color: "#9fb0d0", lineHeight: 1.75, marginTop: 0 }}>
                Your application for <strong>{submittedRole}</strong> has been
                received. Save your tracking code to check your status later.
              </p>

              <div
                style={{
                  marginTop: 22,
                  padding: "22px",
                  borderRadius: "20px",
                  background: "rgba(11, 21, 43, 0.88)",
                  border: "1px solid #22304d",
                }}
              >
                <p style={{ margin: "0 0 8px 0", color: "#9fb0d0" }}>
                  Your Tracking Code
                </p>
                <h2
                  style={{ margin: 0, fontSize: "34px", wordBreak: "break-word" }}
                >
                  {submittedCode}
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "22px",
                }}
              >
                <a href="/status" style={ghostButtonStyle}>
                  Check Application Status
                </a>
                <button
                  onClick={() => {
                    setSubmittedCode("");
                    setSubmittedRole("");
                  }}
                  style={{ ...primaryButtonStyle, width: "auto" }}
                >
                  Send Another Application
                </button>
              </div>
            </section>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AurosBackground />

      <main style={pageStyle}>
        <div style={containerStyle}>
          <AurosTopbar current="apply" />

          <style jsx>{`
            .topRow {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              align-items: center;
              margin-bottom: 18px;
              flex-wrap: wrap;
            }

            .topActions {
              display: flex;
              gap: 10px;
              flex-wrap: wrap;
            }

            .heroGrid {
              display: grid;
              grid-template-columns: 1.15fr 0.85fr;
              gap: 24px;
              align-items: center;
            }

            .contentGrid {
              display: grid;
              grid-template-columns: 0.92fr 1.08fr;
              gap: 22px;
              align-items: start;
            }

            .twoCol {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
            }

            @media (max-width: 980px) {
              .heroGrid,
              .contentGrid,
              .twoCol {
                grid-template-columns: 1fr;
              }
            }

            @media (max-width: 640px) {
              .heroCard {
                padding: 24px !important;
              }

              .heroTitle {
                font-size: 36px !important;
              }

              .topActions a {
                width: 100%;
              }
            }
          `}</style>

          <div className="topRow">
            <a href="/" style={ghostButtonStyle}>
              ← Back to Home
            </a>

            <div className="topActions">
              <span style={pillStyle}>AUROS APPLICATIONS</span>
              <a href="/status" style={ghostButtonStyle}>
                Check Status
              </a>
            </div>
          </div>

          <section
            className="heroCard"
            style={{ ...glassCardStyle, padding: "34px", marginBottom: "22px" }}
          >
            <div className="heroGrid">
              <div>
                <p
                  style={{
                    color: "#4cc9f0",
                    fontWeight: 800,
                    marginBottom: 10,
                    fontSize: "13px",
                    letterSpacing: "0.08em",
                  }}
                >
                  OPEN STAFF APPLICATIONS
                </p>

                <h1
                  className="heroTitle"
                  style={{
                    margin: 0,
                    fontSize: "46px",
                    lineHeight: 1.05,
                    marginBottom: "16px",
                  }}
                >
                  Apply for Auros
                </h1>

                <p
                  style={{
                    color: "#9fb0d0",
                    lineHeight: 1.75,
                    fontSize: "17px",
                    marginTop: 0,
                    marginBottom: 0,
                    maxWidth: "760px",
                  }}
                >
                  Choose an open role, review the full role details, answer the
                  required questions, and submit your staff application directly
                  to the Auros team.
                </p>
              </div>

              <div
                style={{
                  background: "rgba(11, 21, 43, 0.84)",
                  border: "1px solid #22304d",
                  borderRadius: "20px",
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    marginTop: 0,
                    marginBottom: "10px",
                    color: "#4cc9f0",
                    fontWeight: 800,
                    fontSize: "13px",
                    letterSpacing: "0.08em",
                  }}
                >
                  APPLICANT TOOLS
                </p>

                <div style={{ display: "grid", gap: "12px" }}>
                  <a href="/status" style={ghostButtonStyle}>
                    Check Application Status
                  </a>
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "14px",
                      background: "#081225",
                      border: "1px solid #22304d",
                      color: "#dbe7ff",
                    }}
                  >
                    After submitting, you receive a tracking code for status checks.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="contentGrid">
            <section style={glassCardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 12 }}>Open Roles</h2>
              <p
                style={{
                  color: "#9fb0d0",
                  marginTop: 0,
                  marginBottom: "18px",
                  lineHeight: 1.6,
                }}
              >
                Review currently open staff positions and choose the one that
                fits you best.
              </p>

              {jobs.length === 0 ? (
                <div
                  style={{
                    border: "1px solid #22304d",
                    borderRadius: "16px",
                    padding: "18px",
                    background: "#0b152b",
                    color: "#9fb0d0",
                  }}
                >
                  No open jobs are available right now.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {jobs.map((job) => {
                    const active = job.id === jobId;

                    return (
                      <button
                        key={job.id}
                        onClick={() => setJobId(job.id)}
                        style={{
                          textAlign: "left",
                          width: "100%",
                          borderRadius: "18px",
                          padding: "18px",
                          cursor: "pointer",
                          border: active
                            ? "1px solid rgba(76, 201, 240, 0.38)"
                            : "1px solid #22304d",
                          background: active
                            ? "linear-gradient(180deg, rgba(76, 201, 240, 0.12) 0%, rgba(123, 97, 255, 0.10) 100%)"
                            : "rgba(11, 21, 43, 0.88)",
                          color: "white",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px",
                            flexWrap: "wrap",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <h3 style={{ margin: 0 }}>{job.title || "Untitled Role"}</h3>
                          <span style={pillStyle}>{job.role_category || "Other"}</span>
                        </div>

                        <p
                          style={{
                            margin: "0 0 8px 0",
                            color: "#9fb0d0",
                            lineHeight: 1.5,
                          }}
                        >
                          {job.department || "-"} • {job.location || "-"}
                        </p>

                        <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.6 }}>
                          {job.description || "No description available."}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section style={glassCardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 12 }}>Application Form</h2>
              <p
                style={{
                  color: "#9fb0d0",
                  marginTop: 0,
                  marginBottom: "18px",
                  lineHeight: 1.6,
                }}
              >
                Fill in your details and answer the required questions for your
                selected role.
              </p>

              {jobs.length === 0 ? (
                <div
                  style={{
                    border: "1px solid #22304d",
                    borderRadius: "16px",
                    padding: "18px",
                    background: "#0b152b",
                    color: "#9fb0d0",
                  }}
                >
                  Applications are currently unavailable because there are no
                  open roles.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "18px" }}>
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "18px",
                      background: "rgba(11, 21, 43, 0.88)",
                      border: "1px solid #22304d",
                    }}
                  >
                    <label style={labelStyle}>Selected Role</label>

                    <select
                      value={jobId}
                      onChange={(e) => setJobId(e.target.value)}
                      style={inputStyle}
                    >
                      {jobs.map((job) => (
                        <option
                          key={job.id}
                          value={job.id}
                          style={{ background: "#0b152b", color: "white" }}
                        >
                          {job.title} {job.department ? `- ${job.department}` : ""}
                        </option>
                      ))}
                    </select>

                    {selectedJob && (
                      <div
                        style={{
                          marginTop: "14px",
                          padding: "14px",
                          borderRadius: "14px",
                          background: "#081225",
                          border: "1px solid #22304d",
                        }}
                      >
                        <p style={{ margin: "0 0 8px 0", color: "#dbe7ff" }}>
                          <strong>{selectedJob.title || "Selected Role"}</strong>
                        </p>
                        <p style={{ margin: "0 0 8px 0", color: "#9fb0d0" }}>
                          {selectedJob.department || "-"} • {selectedJob.location || "-"}
                        </p>
                        <p style={{ margin: 0, color: "#dbe7ff", lineHeight: 1.6 }}>
                          {selectedJob.description || "-"}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginTop: "12px",
                          }}
                        >
                          <span style={pillStyle}>{selectedCategory}</span>
                          {selectedJob.requirements &&
                            selectedJob.requirements.length > 0 &&
                            selectedJob.requirements.map((req) => (
                              <span key={req} style={pillStyle}>
                                {req}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="twoCol">
                    <div>
                      <label style={labelStyle}>Name</label>
                      <input
                        style={inputStyle}
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Discord Username</label>
                      <input
                        style={inputStyle}
                        placeholder="e.g. Name#1234"
                        value={discord}
                        onChange={(e) => setDiscord(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="twoCol">
                    <div>
                      <label style={labelStyle}>Discord Name</label>
                      <input
                        style={inputStyle}
                        placeholder="Display name / nickname"
                        value={discordName}
                        onChange={(e) => setDiscordName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Timezone</label>
                      <input
                        style={inputStyle}
                        placeholder="e.g. CET / GMT+1"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="twoCol">
                    <div>
                      <label style={labelStyle}>Age</label>
                      <input
                        style={inputStyle}
                        placeholder="Your age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Email</label>
                      <input
                        style={inputStyle}
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Experience</label>
                    <textarea
                      style={textareaStyle}
                      placeholder="Tell us about your experience"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </div>

                  {isDeveloper && (
                    <>
                      <div>
                        <label style={labelStyle}>Developer Skills</label>
                        <textarea
                          style={textareaStyle}
                          placeholder="Which languages, frameworks, tools or systems do you know?"
                          value={developerSkills}
                          onChange={(e) => setDeveloperSkills(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Developer Projects</label>
                        <textarea
                          style={textareaStyle}
                          placeholder="Tell us about projects you worked on."
                          value={developerProjects}
                          onChange={(e) => setDeveloperProjects(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {isSupporter && (
                    <>
                      <div>
                        <label style={labelStyle}>Support Experience</label>
                        <textarea
                          style={textareaStyle}
                          placeholder="Tell us about moderation, support, or handling user issues."
                          value={supportCases}
                          onChange={(e) => setSupportCases(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Communication Skills</label>
                        <textarea
                          style={textareaStyle}
                          placeholder="How do you deal with difficult users or conflict situations?"
                          value={supportCommunication}
                          onChange={(e) => setSupportCommunication(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {isCompetitiveManager && (
                    <>
                      <div>
                        <label style={labelStyle}>Competitive Knowledge</label>
                        <textarea
                          style={textareaStyle}
                          placeholder="Describe your knowledge of competitive systems, teams, or tournaments."
                          value={competitiveKnowledge}
                          onChange={(e) => setCompetitiveKnowledge(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Plans for Competitive</label>
                        <textarea
                          style={textareaStyle}
                          placeholder="What would you improve or build in the competitive area?"
                          value={competitivePlans}
                          onChange={(e) => setCompetitivePlans(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {isManager && (
                    <>
                      <div>
                        <label style={labelStyle}>Leadership Experience</label>
                        <textarea
                          style={textareaStyle}
                          placeholder="Tell us about leadership, team handling, or project management."
                          value={managerLeadership}
                          onChange={(e) => setManagerLeadership(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Organization Skills</label>
                        <textarea
                          style={textareaStyle}
                          placeholder="How do you organize people, tasks, and priorities?"
                          value={managerOrganization}
                          onChange={(e) => setManagerOrganization(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {isDirector && (
                    <>
                      <div>
                        <label style={labelStyle}>Vision</label>
                        <textarea
                          style={textareaStyle}
                          placeholder="What long-term vision would you bring to Auros?"
                          value={directorVision}
                          onChange={(e) => setDirectorVision(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Responsibility</label>
                        <textarea
                          style={textareaStyle}
                          placeholder="Why are you ready for a high-responsibility leadership role?"
                          value={directorResponsibility}
                          onChange={(e) => setDirectorResponsibility(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {isOther && (
                    <div>
                      <label style={labelStyle}>Why do you fit this role?</label>
                      <textarea
                        style={textareaStyle}
                        placeholder="Tell us what makes you a good fit for this position."
                        value={otherStrengths}
                        onChange={(e) => setOtherStrengths(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}>Motivation</label>
                    <textarea
                      style={{ ...textareaStyle, minHeight: "150px" }}
                      placeholder="Why should we accept you?"
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Availability</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. 4 evenings a week"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={submitApplication}
                    disabled={loading}
                    style={{
                      ...primaryButtonStyle,
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}